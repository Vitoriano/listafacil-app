import { useQuery } from '@tanstack/react-query';
import { priceRepository } from '@/data/repositories';
import type { PriceHistoryPoint } from '@/features/prices/types';

export function usePriceHistory(productId: string | null, storeId?: string) {
  return useQuery<PriceHistoryPoint[]>({
    queryKey: ['prices', productId, 'history', storeId],
    queryFn: () => priceRepository.getHistory(productId!, storeId),
    enabled: !!productId,
  });
}
