import { create } from 'zustand';

interface ProductFilterState {
  search: string;
  categoryId: number | undefined;
  setSearch: (search: string) => void;
  setCategoryId: (categoryId: number | undefined) => void;
  reset: () => void;
}

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  search: '',
  categoryId: undefined,
  setSearch: (search) => set({ search }),
  setCategoryId: (categoryId) => set({ categoryId }),
  reset: () => set({ search: '', categoryId: undefined }),
}));
