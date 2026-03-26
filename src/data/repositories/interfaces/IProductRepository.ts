import type { Product, ProductQueryParams } from '@/features/products/types';
import type { Paginated } from '@/shared/types';

export interface IProductRepository {
  getAll(params: ProductQueryParams): Promise<Paginated<Product>>;
  getById(id: string): Promise<Product | null>;
  searchByBarcode(barcode: string): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
}
