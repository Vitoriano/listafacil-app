import type { LatestPrice, Product } from '@/features/products/types';
import type { Paginated } from '@/shared/types';
import {
  buildProductImageUrl,
  describeProductImageResolution,
  storageFolderPrefix,
} from '@/lib/productImageUrl';
import { logger } from '@/shared/utils/logger';

export type ProductApiRow = Product & {
  image_url?: string | null;
  latestPrice?: unknown;
};

function rawImageKey(row: ProductApiRow): string | null | undefined {
  return row.imageUrl ?? row.image_url;
}

/**
 * A API devolve o nome/path no Storage ou URL https.
 * Chave de Storage → URL REST `firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodeURIComponent(path)}?alt=media`
 * (bucket novo: `*.firebasestorage.app`).
 */
export function mapProductFromApi(raw: ProductApiRow): Product {
  const key = rawImageKey(raw);
  const isHttp =
    key &&
    (key.startsWith('http://') || key.startsWith('https://'));
  const imageUrl = isHttp ? key : buildProductImageUrl(key);
  const { image_url: _omitUrl, ...rest } = raw;

  if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_IMAGES === '1') {
    const d = describeProductImageResolution(key);
    logger.info('Products', 'Imagem produto', {
      id: raw.id,
      ...d,
      pathPrefix: storageFolderPrefix() || '(raiz)',
    });
  }

  if (__DEV__ && key && !isHttp && !imageUrl) {
    logger.warn(
      'Products',
      'image_url da API nao virou URL — confira chave e EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      describeProductImageResolution(key),
    );
  }

  const rawLatest = raw.latestPrice as Record<string, unknown> | null | undefined;
  const latestPrice: LatestPrice | null =
    rawLatest && typeof rawLatest === 'object'
      ? {
          id: String(rawLatest.id ?? ''),
          price: parseFloat(String(rawLatest.price)) || 0,
          storeId: String(rawLatest.storeId ?? ''),
          submittedAt: String(rawLatest.submittedAt ?? ''),
          store:
            rawLatest.store && typeof rawLatest.store === 'object'
              ? {
                  id: String((rawLatest.store as Record<string, unknown>).id ?? ''),
                  name: String((rawLatest.store as Record<string, unknown>).name ?? ''),
                }
              : { id: '', name: '' },
        }
      : null;

  const rawCategory = (raw as unknown as Record<string, unknown>).category as Record<string, unknown> | undefined;
  const categoryName = rawCategory?.name ? String(rawCategory.name) : null;

  return {
    ...rest,
    latestPrice,
    categoryName,
    imageStorageKey: isHttp ? null : (key ?? null),
    imageUrl,
  };
}

/**
 * API returns { data: [...], meta: { total, page, limit, totalPages } }
 * App expects { data: [...], total, page, limit, hasMore }
 */
export function mapPaginatedProducts(
  raw: Record<string, unknown>,
): Paginated<Product> {
  const data = Array.isArray(raw.data) ? raw.data : [];
  const meta = (raw.meta as Record<string, unknown>) ?? raw;
  const total = Number(meta.total ?? data.length) || 0;
  const page = Number(meta.page ?? 1) || 1;
  const limit = Number(meta.limit ?? 20) || 20;
  const totalPages = Number(meta.totalPages ?? Math.ceil(total / limit)) || 1;

  return {
    data: data.map((r) => mapProductFromApi(r as ProductApiRow)),
    total,
    page,
    limit,
    hasMore: page < totalPages,
  };
}

/**
 * Percorre payloads da API e aplica `mapProductFromApi` a todo objeto `product` aninhado
 * (ex.: itens de lista, itens de compra) e em arrays `items`.
 */
export function mapPayloadWithNestedProducts<T>(payload: T): T {
  if (payload == null || typeof payload !== 'object') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((x) => mapPayloadWithNestedProducts(x)) as unknown as T;
  }

  const o = payload as Record<string, unknown>;
  let next: Record<string, unknown> = { ...o };

  if (
    next.product != null &&
    typeof next.product === 'object' &&
    !Array.isArray(next.product)
  ) {
    next = {
      ...next,
      product: mapProductFromApi(next.product as ProductApiRow),
    };
  }

  if (Array.isArray(next.items)) {
    next = {
      ...next,
      items: next.items.map((x) => mapPayloadWithNestedProducts(x)),
    };
  }

  return next as T;
}
