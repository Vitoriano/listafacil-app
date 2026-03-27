import type { Category, SubCategory } from '@/features/products/types';

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category | null>;
  getSubCategories(categoryId: number): Promise<SubCategory[]>;
}
