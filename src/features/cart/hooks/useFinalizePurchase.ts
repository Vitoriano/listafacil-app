import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRepository } from '@/data/repositories';

export function useFinalizePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purchaseId: string) =>
      purchaseRepository.update(purchaseId, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}
