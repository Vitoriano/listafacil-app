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

  addItem: (item) => {
    const { purchaseId, items } = useCartStore.getState();
    const existing = items.find((i) => i.productId === item.productId);

    if (existing) {
      // Update locally first
      const newItems = items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity, price: item.price }
          : i,
      );
      set({ items: newItems, ...recalculate(newItems) });

      // Sync with backend
      if (purchaseId && existing.id) {
        purchaseRepository
          .updateItem(purchaseId, existing.id, {
            price: item.price,
            quantity: existing.quantity + item.quantity,
          })
          .catch(() => {});
      }
    } else {
      // Optimistic local id
      const tempId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newItem: PurchaseItem = { ...item, id: tempId };
      const newItems = [...items, newItem];
      set({ items: newItems, ...recalculate(newItems) });

      // Persist to backend and replace temp id with real one
      if (purchaseId) {
        purchaseRepository
          .addItem(purchaseId, {
            productId: item.productId,
            barcode: item.barcode,
            price: item.price,
            quantity: item.quantity,
            fromListId: item.fromListId,
          })
          .then((saved) => {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === tempId ? { ...i, id: saved.id } : i,
              ),
            }));
          })
          .catch(() => {});
      }
    }
  },

  removeItem: (itemId) => {
    const { purchaseId } = useCartStore.getState();
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return { items: newItems, ...recalculate(newItems) };
    });
    if (purchaseId) {
      purchaseRepository.removeItem(purchaseId, itemId).catch(() => {});
    }
  },

  updateItemQuantity: (itemId, quantity) => {
    const { purchaseId } = useCartStore.getState();
    if (quantity <= 0) {
      set((state) => {
        const newItems = state.items.filter((i) => i.id !== itemId);
        return { items: newItems, ...recalculate(newItems) };
      });
      if (purchaseId) {
        purchaseRepository.removeItem(purchaseId, itemId).catch(() => {});
      }
    } else {
      set((state) => {
        const newItems = state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i,
        );
        return { items: newItems, ...recalculate(newItems) };
      });
      if (purchaseId) {
        purchaseRepository.updateItem(purchaseId, itemId, { quantity }).catch(() => {});
      }
    }
  },

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
