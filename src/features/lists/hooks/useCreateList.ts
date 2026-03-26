import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { CreateShoppingList } from '@/features/lists/types';

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShoppingList) => listRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
