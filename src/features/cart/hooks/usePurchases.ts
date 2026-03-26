import { useQuery } from '@tanstack/react-query';
import { purchaseRepository } from '@/data/repositories';
import type { Purchase } from '../types';

export function usePurchases() {
  return useQuery<Purchase[]>({
    queryKey: ['purchases'],
    queryFn: () => purchaseRepository.getAll(),
  });
}

export function useRecentPurchases(limit: number = 5) {
  return useQuery<Purchase[]>({
    queryKey: ['purchases', 'recent', limit],
    queryFn: () => purchaseRepository.getRecent(limit),
  });
}
