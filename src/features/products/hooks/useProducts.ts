import { useQuery } from '@tanstack/react-query';
import { productRepository } from '@/data/repositories';
import type { Product, ProductQueryParams } from '@/features/products/types';
import type { Paginated } from '@/shared/types';

export function useProducts(params: ProductQueryParams) {
  return useQuery<Paginated<Product>>({
    queryKey: ['products', params],
    queryFn: () => productRepository.getAll(params),
  });
}
