import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRepository } from '@/data/repositories';
import type { Purchase } from '../types';

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purchase: Purchase) => purchaseRepository.create(purchase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}
