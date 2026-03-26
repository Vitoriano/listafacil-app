import { useQuery } from '@tanstack/react-query';
import { productRepository } from '@/data/repositories';
import type { Product } from '@/features/products/types';

export function useProductDetail(id: string | null) {
  return useQuery<Product | null>({
    queryKey: ['products', id],
    queryFn: () => productRepository.getById(id!),
    enabled: !!id,
  });
}
