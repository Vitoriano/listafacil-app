import { simulateDelay } from '@/data/helpers/delay';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category, SubCategory } from '@/features/products/types';
import seedProducts from '@/data/seed/products.json';

const CATEGORY_NAMES: Record<number, string> = {
  1: 'Frutas',
  2: 'Legumes e Verduras',
  3: 'Laticínios',
  4: 'Carnes',
  5: 'Padaria',
  6: 'Bebidas',
  7: 'Limpeza',
  8: 'Higiene',
  9: 'Biscoitos e Cereais',
  10: 'Grãos',
  11: 'Aves',
  12: 'Mercearia',
};

/**
 * Categories derived from the distinct `categoryId`s present in the product seed,
 * so mock products always resolve to an existing category.
 */
const CATEGORIES: Category[] = [
  ...new Set((seedProducts as { categoryId: number }[]).map((p) => p.categoryId)),
]
  .sort((a, b) => a - b)
  .map((id) => ({ id, name: CATEGORY_NAMES[id] ?? `Categoria ${id}` }));

export class MockCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    await simulateDelay();
    return [...CATEGORIES];
  }

  async getById(id: number): Promise<Category | null> {
    await simulateDelay();
    return CATEGORIES.find((c) => c.id === id) ?? null;
  }

  async getSubCategories(_categoryId: number): Promise<SubCategory[]> {
    await simulateDelay();
    return [];
  }
}
