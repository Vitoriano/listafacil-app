import { useQuery } from '@tanstack/react-query';
import { priceRepository } from '@/data/repositories';
import type { PriceComparison } from '@/features/prices/types';

export function usePriceComparison(productId: string | null) {
  return useQuery<PriceComparison>({
    queryKey: ['prices', productId, 'comparison'],
    queryFn: () => priceRepository.getComparison(productId!),
    enabled: !!productId,
  });
}
