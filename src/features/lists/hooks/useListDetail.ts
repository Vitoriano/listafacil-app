import { useQuery } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { ShoppingList } from '@/features/lists/types';

export function useListDetail(listId: string | null) {
  return useQuery<ShoppingList | null>({
    queryKey: ['lists', listId],
    queryFn: () => listRepository.getById(listId!),
    enabled: !!listId,
  });
}
