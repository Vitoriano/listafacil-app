import { create } from 'zustand';
import type { ProductCategory, ProductQueryParams } from '@/features/products/types';

interface ProductFilterState {
  search: string;
  category: ProductCategory | undefined;
  sortBy: ProductQueryParams['sortBy'];
  setSearch: (search: string) => void;
  setCategory: (category: ProductCategory | undefined) => void;
  setSortBy: (sortBy: ProductQueryParams['sortBy']) => void;
  reset: () => void;
}

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  search: '',
  category: undefined,
  sortBy: 'name',
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set({ search: '', category: undefined, sortBy: 'name' }),
}));
