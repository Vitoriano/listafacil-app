import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { UpdateListItem } from '@/features/lists/types';

interface UpdateItemParams {
  listId: string;
  itemId: string;
  data: UpdateListItem;
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId, data }: UpdateItemParams) =>
      listRepository.updateItem(listId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
    },
  });
}
