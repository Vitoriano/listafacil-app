import { useQuery } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { ShoppingList } from '@/features/lists/types';

export function useLists() {
  return useQuery<ShoppingList[]>({
    queryKey: ['lists'],
    queryFn: () => listRepository.getAll(),
  });
}
