import { api } from '@/config/api';
import type { IProductRepository } from '../interfaces/IProductRepository';
import type { Product, ProductQueryParams } from '@/features/products/types';
import type { Paginated } from '@/shared/types';
import {
  mapPaginatedProducts,
  mapProductFromApi,
  type ProductApiRow,
} from '@/lib/mapProductFromApi';

export class ApiProductRepository implements IProductRepository {
  async getAll(params: ProductQueryParams): Promise<Paginated<Product>> {
    const { data } = await api.get('/products', { params });
    return mapPaginatedProducts(data as Record<string, unknown>);
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const { data } = await api.get<ProductApiRow>(`/products/${id}`);
      return mapProductFromApi(data);
    } catch {
      return null;
    }
  }

  async searchByBarcode(barcode: string): Promise<Product | null> {
    try {
      const { data } = await api.get<ProductApiRow>(
        `/products/barcode/${barcode}`,
      );
      return mapProductFromApi(data);
    } catch {
      return null;
    }
  }

  async search(query: string): Promise<Product[]> {
    const { data } = await api.get('/products', {
      params: { q: query, limit: 50 },
    });
    return mapPaginatedProducts(data as Record<string, unknown>).data;
  }
}
