import { create } from 'zustand';
import { purchaseRepository } from '@/data/repositories';
import type { PurchaseItem } from '../types';
import type { ListItem } from '@/features/lists/types';

interface CartState {
  isActive: boolean;
  purchaseId: string | null;
  storeId: string | null;
  storeName: string | null;
  items: PurchaseItem[];
  total: number;
  itemCount: number;

  linkedListId: string | null;
  linkedListName: string | null;
  linkedListItems: ListItem[];

  isStarting: boolean;
  startSession: (storeId: string, storeName: string) => Promise<void>;
  addItem: (item: Omit<PurchaseItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  linkList: (listId: string, listName: string, items: ListItem[]) => void;
  unlinkList: () => void;
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
  linkedListId: null,
  linkedListName: null,
  linkedListItems: [],
  isStarting: false,

  startSession: async (storeId, storeName) => {
    set({ isStarting: true });
    try {
      const purchase = await purchaseRepository.create({ storeId });
      set({
        isActive: true,
        purchaseId: purchase.id,
        storeId,
        storeName,
        items: [],
        total: 0,
        itemCount: 0,
        linkedListId: null,
        linkedListName: null,
        linkedListItems: [],
        isStarting: false,
      });
    } catch {
      set({ isStarting: false });
      throw new Error('Falha ao iniciar sessao de compra');
    }
  },

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

  linkList: (listId, listName, items) =>
    set({ linkedListId: listId, linkedListName: listName, linkedListItems: items }),

  unlinkList: () =>
    set({ linkedListId: null, linkedListName: null, linkedListItems: [] }),

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
      linkedListId: null,
      linkedListName: null,
      linkedListItems: [],
      isStarting: false,
    }),
}));
