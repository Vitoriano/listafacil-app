import { api } from '@/config/api';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category, SubCategory } from '@/features/products/types';

export class ApiCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    return data;
  }

  async getById(id: number): Promise<Category | null> {
    try {
      const { data } = await api.get(`/categories/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async getSubCategories(categoryId: number): Promise<SubCategory[]> {
    const { data } = await api.get(`/categories/${categoryId}/sub-categories`);
    return data;
  }
}
