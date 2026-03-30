import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { UpdateShoppingList } from '@/features/lists/types';

interface UpdateListParams {
  listId: string;
  data: UpdateShoppingList;
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: UpdateListParams) =>
      listRepository.update(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
    },
  });
}
