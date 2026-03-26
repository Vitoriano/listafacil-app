import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';

interface RemoveItemParams {
  listId: string;
  itemId: string;
}

export function useRemoveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId }: RemoveItemParams) =>
      listRepository.removeItem(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
    },
  });
}
