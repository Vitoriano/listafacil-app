import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { CreateListItem } from '@/features/lists/types';

interface AddItemParams {
  listId: string;
  item: CreateListItem;
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, item }: AddItemParams) =>
      listRepository.addItem(listId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
    },
  });
}
