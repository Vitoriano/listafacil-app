import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => listRepository.delete(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
