import { useQuery } from '@tanstack/react-query';
import { purchaseRepository } from '@/data/repositories';
import type { Purchase } from '../types';

export function usePurchaseDetail(id: string | null) {
  return useQuery<Purchase | null>({
    queryKey: ['purchases', id],
    queryFn: () => purchaseRepository.getById(id!),
    enabled: !!id,
  });
}
