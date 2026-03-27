import { api } from '@/config/api';
import type { IProductRepository } from '../interfaces/IProductRepository';
import type { Product, ProductQueryParams } from '@/features/products/types';
import type { Paginated } from '@/shared/types';

export class ApiProductRepository implements IProductRepository {
  async getAll(params: ProductQueryParams): Promise<Paginated<Product>> {
    const { data } = await api.get('/products', { params });
    return data;
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async searchByBarcode(barcode: string): Promise<Product | null> {
    try {
      const { data } = await api.get(`/products/barcode/${barcode}`);
      return data;
    } catch {
      return null;
    }
  }

  async search(query: string): Promise<Product[]> {
    const { data } = await api.get<Paginated<Product>>('/products', {
      params: { q: query, limit: 50 },
    });
    return data.data;
  }
}
