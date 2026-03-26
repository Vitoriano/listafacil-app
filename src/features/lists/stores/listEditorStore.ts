import { create } from 'zustand';

interface ListEditorState {
  searchQuery: string;
  selectedProductId: string;
  setSearchQuery: (query: string) => void;
  setSelectedProductId: (productId: string) => void;
  reset: () => void;
}

export const useListEditorStore = create<ListEditorState>((set) => ({
  searchQuery: '',
  selectedProductId: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedProductId: (productId) => set({ selectedProductId: productId }),
  reset: () => set({ searchQuery: '', selectedProductId: '' }),
}));
