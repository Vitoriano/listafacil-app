import { api } from '@/config/api';
import type { IPurchaseRepository } from '../interfaces/IPurchaseRepository';
import type {
  Purchase,
  PurchaseItem,
  LinkedListSnapshot,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  AddPurchaseItemPayload,
  UpdatePurchaseItemPayload,
} from '@/features/cart/types';
import type { ListItem } from '@/features/lists/types';

/**
 * API item shape:
 * { id, purchaseId, productId, barcode, price: "4.89" (string!), quantity, fromListId,
 *   product: { id, name, brand, barcode, ... } }
 */
function mapPurchaseItemFromApi(raw: Record<string, unknown>): PurchaseItem {
  const product = raw.product as Record<string, unknown> | undefined;

  return {
    id: String(raw.id ?? ''),
    productId: String(raw.productId ?? product?.id ?? ''),
    productName: String(product?.name ?? 'Produto'),
    barcode: String(raw.barcode ?? product?.barcode ?? ''),
    price: parseFloat(String(raw.price)) || 0,
    quantity: Number(raw.quantity) || 1,
    fromListId: raw.fromListId != null ? String(raw.fromListId) : undefined,
  };
}

function mapLinkedListItemFromApi(raw: Record<string, unknown>): ListItem {
  const product = raw.product as Record<string, unknown> | undefined;
  return {
    id: String(raw.id ?? ''),
    productId: String(raw.productId ?? product?.id ?? ''),
    productName: String(product?.name ?? 'Produto'),
    quantity: Number(raw.quantity) || 1,
    unit: String(product?.unit ?? 'un'),
    estimatedPrice: parseFloat(String(raw.estimatedPrice ?? 0)) || 0,
    checked: Boolean(raw.checked),
  };
}

function mapLinkedListFromApi(raw: unknown): LinkedListSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const list = raw as Record<string, unknown>;
  const rawItems = Array.isArray(list.items) ? list.items : [];
  return {
    id: String(list.id ?? ''),
    name: String(list.name ?? ''),
    items: rawItems.map((r) => mapLinkedListItemFromApi(r as Record<string, unknown>)),
  };
}

/**
 * API purchase shape:
 * { id, userId, storeId, linkedListId, status, createdAt, completedAt,
 *   store: { id, name, ... },
 *   items?: [...],             // only on getById
 *   _count?: { items: N } }   // on list endpoints
 */
function mapPurchaseFromApi(raw: Record<string, unknown>): Purchase {
  const store = raw.store as Record<string, unknown> | undefined;
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((r) => mapPurchaseItemFromApi(r as Record<string, unknown>));
  const count = raw._count as Record<string, unknown> | undefined;
  const calculatedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const apiTotal = raw.total != null ? parseFloat(String(raw.total)) : NaN;

  return {
    id: String(raw.id ?? ''),
    storeId: String(raw.storeId ?? store?.id ?? ''),
    storeName: String(store?.name ?? ''),
    date: String(raw.createdAt ?? ''),
    items,
    total: !Number.isNaN(apiTotal) ? apiTotal : calculatedTotal,
    itemCount: Number(count?.items ?? items.length) || 0,
    status: (raw.status as Purchase['status']) ?? 'completed',
    createdAt: String(raw.createdAt ?? ''),
    completedAt: raw.completedAt != null ? String(raw.completedAt) : null,
    linkedListId: raw.linkedListId != null ? String(raw.linkedListId) : null,
    linkedList: mapLinkedListFromApi(raw.linkedList),
  };
}

/**
 * GET /purchases returns { data: [...], meta: {...} }
 * GET /purchases/recent returns [...]
 */
function mapPurchaseList(data: unknown): Purchase[] {
  const arr = Array.isArray(data)
    ? data
    : (data as Record<string, unknown>)?.data;
  if (!Array.isArray(arr)) return [];
  return arr.map((r) => mapPurchaseFromApi(r as Record<string, unknown>));
}

export class ApiPurchaseRepository implements IPurchaseRepository {
  async getAll(): Promise<Purchase[]> {
    const { data } = await api.get('/purchases', {
      params: { limit: 50 },
    });
    return mapPurchaseList(data);
  }

  async getById(id: string): Promise<Purchase | null> {
    try {
      const { data } = await api.get(`/purchases/${id}`);
      return mapPurchaseFromApi(data as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async getActive(): Promise<Purchase | null> {
    const { data } = await api.get('/purchases/active');
    if (!data || typeof data !== 'object') return null;
    return mapPurchaseFromApi(data as Record<string, unknown>);
  }

  async create(payload: CreatePurchasePayload): Promise<Purchase> {
    const { data } = await api.post('/purchases', payload);
    return mapPurchaseFromApi(data as Record<string, unknown>);
  }

  async update(
    id: string,
    payload: UpdatePurchasePayload,
  ): Promise<Purchase | null> {
    try {
      const { data } = await api.patch(`/purchases/${id}`, payload);
      return mapPurchaseFromApi(data as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async getRecent(limit: number = 5): Promise<Purchase[]> {
    const { data } = await api.get('/purchases/recent', {
      params: { limit },
    });
    return mapPurchaseList(data);
  }

  async addItem(
    purchaseId: string,
    item: AddPurchaseItemPayload,
  ): Promise<PurchaseItem> {
    const { data } = await api.post(`/purchases/${purchaseId}/items`, item);
    return mapPurchaseItemFromApi(data as Record<string, unknown>);
  }

  async updateItem(
    purchaseId: string,
    itemId: string,
    updateData: UpdatePurchaseItemPayload,
  ): Promise<PurchaseItem> {
    const { data } = await api.patch(
      `/purchases/${purchaseId}/items/${itemId}`,
      updateData,
    );
    return mapPurchaseItemFromApi(data as Record<string, unknown>);
  }

  async removeItem(purchaseId: string, itemId: string): Promise<void> {
    await api.delete(`/purchases/${purchaseId}/items/${itemId}`);
  }
}
