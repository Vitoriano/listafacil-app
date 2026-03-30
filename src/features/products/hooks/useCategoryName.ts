import { useCategories } from './useCategories';
import type { Product } from '../types';

/**
 * Resolve o nome da categoria. Usa `product.categoryName` da API se disponível,
 * senão faz lookup pelo `categoryId` via hook useCategories (cache de 1h).
 */
export function useCategoryName(
  categoryIdOrProduct: number | null | undefined | Product,
): string {
  const isProduct = typeof categoryIdOrProduct === 'object' && categoryIdOrProduct !== null;
  const categoryName = isProduct ? categoryIdOrProduct.categoryName : null;
  const categoryId = isProduct ? categoryIdOrProduct.categoryId : categoryIdOrProduct;

  const { data: categories } = useCategories();

  if (categoryName) return categoryName;
  if (categoryId == null || !categories) return '—';
  return categories.find((c) => c.id === categoryId)?.name ?? '—';
}
