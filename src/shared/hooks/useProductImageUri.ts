import { useEffect, useMemo, useState } from 'react';
import { resolveProductImageDownloadUrl } from '@/lib/resolveFirebaseStorageImage';

type ProductImageInput = {
  id: string;
  imageUrl: string | null;
  imageStorageKey?: string | null;
};

/**
 * React Native: use `source={{ uri }}` com o valor devolvido (URL https válida).
 * Prioridade: `getDownloadURL` (SDK) com `imageStorageKey`; senão `imageUrl` (REST ou URL da API).
 */
export function useProductImageUri(
  product: ProductImageInput | null | undefined,
): { uri: string | null; loading: boolean } {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) {
      setUri(null);
      setLoading(false);
      return;
    }

    const key = product.imageStorageKey;
    const fallback = product.imageUrl;

    let cancelled = false;

    async function run() {
      if (key !== null && key !== undefined && key !== '') {
        setLoading(true);
        const resolved = await resolveProductImageDownloadUrl(key);
        if (!cancelled) {
          setUri(resolved ?? fallback ?? null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setUri(fallback ?? null);
        setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.imageStorageKey, product?.imageUrl]);

  return useMemo(() => ({ uri, loading }), [uri, loading]);
}
