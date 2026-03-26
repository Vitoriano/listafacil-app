import { useQuery } from '@tanstack/react-query';
import { productRepository } from '@/data/repositories';
import type { Product } from '@/features/products/types';

export function useBarcodeResult(barcode: string | null) {
  return useQuery<Product | null>({
    queryKey: ['products', 'barcode', barcode],
    queryFn: () => productRepository.searchByBarcode(barcode!),
    enabled: !!barcode,
  });
}
