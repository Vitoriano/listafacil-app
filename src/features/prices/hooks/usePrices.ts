import { useQuery } from '@tanstack/react-query';
import { priceRepository } from '@/data/repositories';
import type { PriceEntry, PriceQueryParams } from '@/features/prices/types';
import type { Paginated } from '@/shared/types';

export function usePrices(productId: string | null, params?: PriceQueryParams) {
  return useQuery<Paginated<PriceEntry>>({
    queryKey: ['prices', productId, params],
    queryFn: () => priceRepository.getByProduct(productId!, params),
    enabled: !!productId,
  });
}
