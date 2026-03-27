import { useQuery } from '@tanstack/react-query';
import { categoryRepository } from '@/data/repositories';
import type { Category } from '@/features/products/types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryRepository.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour — categories rarely change
  });
}
