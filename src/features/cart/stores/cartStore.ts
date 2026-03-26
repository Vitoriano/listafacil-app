import { create } from 'zustand';
import type { PurchaseItem } from '../types';

interface CartState {
  isActive: boolean;
  purchaseId: string | null;
  storeId: string | null;
  storeName: string | null;
  items: PurchaseItem[];
  total: number;
  itemCount: number;

  startSession: (storeId: string, storeName: string) => void;
  addItem: (item: Omit<PurchaseItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  reset: () => void;
}

function recalculate(items: PurchaseItem[]) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
}

export const useCartStore = create<CartState>((set) => ({
  isActive: false,
  purchaseId: null,
  storeId: null,
  storeName: null,
  items: [],
  total: 0,
  itemCount: 0,

  startSession: (storeId, storeName) =>
    set({
      isActive: true,
      purchaseId: `purchase-${Date.now()}`,
      storeId,
      storeName,
      items: [],
      total: 0,
      itemCount: 0,
    }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      let newItems: PurchaseItem[];

      if (existing) {
        newItems = state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, price: item.price }
            : i,
        );
      } else {
        const newItem: PurchaseItem = {
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        newItems = [...state.items, newItem];
      }

      return { items: newItems, ...recalculate(newItems) };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return { items: newItems, ...recalculate(newItems) };
    }),

  updateItemQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.id !== itemId);
        return { items: newItems, ...recalculate(newItems) };
      }
      const newItems = state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i,
      );
      return { items: newItems, ...recalculate(newItems) };
    }),

  clearCart: () =>
    set({ items: [], total: 0, itemCount: 0 }),

  reset: () =>
    set({
      isActive: false,
      purchaseId: null,
      storeId: null,
      storeName: null,
      items: [],
      total: 0,
      itemCount: 0,
    }),
}));
