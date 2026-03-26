import { useMutation, useQueryClient } from '@tanstack/react-query';
import { priceRepository } from '@/data/repositories';
import type { CreatePriceEntry } from '@/features/prices/types';

export function useSubmitPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: CreatePriceEntry) => priceRepository.submit(entry),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prices', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
    },
  });
}
