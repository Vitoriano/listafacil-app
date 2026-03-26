import { create } from 'zustand';

interface PriceFormState {
  selectedStoreId: string;
  priceInput: string;
  setSelectedStoreId: (storeId: string) => void;
  setPriceInput: (price: string) => void;
  reset: () => void;
}

export const usePriceFormStore = create<PriceFormState>((set) => ({
  selectedStoreId: '',
  priceInput: '',
  setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),
  setPriceInput: (price) => set({ priceInput: price }),
  reset: () => set({ selectedStoreId: '', priceInput: '' }),
}));
