import { create } from 'zustand';
import { purchaseRepository } from '@/data/repositories';
import { logger } from '@/shared/utils/logger';
import type { Purchase, PurchaseItem } from '../types';
import type { ListItem } from '@/features/lists/types';

/** Lista que acompanha a compra (progresso "x de y itens"). */
export interface LinkedListInput {
  id: string;
  name: string;
  items: ListItem[];
}

interface CartState {
  isActive: boolean;
  /** true enquanto a sessão ainda não foi conferida com a API (evita piscar a tela vazia). */
  isHydrating: boolean;
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
  startSession: (
    storeId: string,
    storeName: string,
    linkedList?: LinkedListInput | null,
  ) => Promise<void>;
  /** Restaura a sessão a partir de uma compra ativa devolvida pela API. */
  hydrate: (purchase: Purchase) => void;
  /** Consulta a API e sincroniza a sessão local (retoma ou descarta). */
  syncFromServer: () => Promise<void>;
  cancelSession: () => Promise<void>;
  addItem: (item: Omit<PurchaseItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  linkList: (list: LinkedListInput) => void;
  unlinkList: () => void;
  clearCart: () => void;
  reset: () => void;
}

function recalculate(items: PurchaseItem[]) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
}

function getConflictPurchaseId(error: unknown): string | null {
  const response = (error as { response?: { status?: number; data?: unknown } })?.response;
  if (response?.status !== 409) return null;
  const data = response.data as { activePurchaseId?: string } | undefined;
  return data?.activePurchaseId ?? null;
}

const EMPTY_SESSION = {
  isActive: false,
  purchaseId: null,
  storeId: null,
  storeName: null,
  items: [] as PurchaseItem[],
  total: 0,
  itemCount: 0,
  linkedListId: null,
  linkedListName: null,
  linkedListItems: [] as ListItem[],
  isStarting: false,
};

export class ActivePurchaseConflictError extends Error {
  constructor(public readonly activePurchaseId: string | null) {
    super('Já existe uma compra em andamento');
    this.name = 'ActivePurchaseConflictError';
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  ...EMPTY_SESSION,
  isHydrating: false,

  startSession: async (storeId, storeName, linkedList) => {
    set({ isStarting: true });
    try {
      const purchase = await purchaseRepository.create({
        storeId,
        linkedListId: linkedList?.id,
      });
      set({
        ...EMPTY_SESSION,
        isActive: true,
        purchaseId: purchase.id,
        storeId,
        storeName,
        linkedListId: linkedList?.id ?? null,
        linkedListName: linkedList?.name ?? null,
        linkedListItems: linkedList?.items ?? [],
      });
    } catch (error) {
      set({ isStarting: false });
      const conflictId = getConflictPurchaseId(error);
      if (conflictId) {
        // Outra sessão ficou aberta (ex.: app fechado no meio da compra): retoma ela.
        await get().syncFromServer();
        throw new ActivePurchaseConflictError(conflictId);
      }
      throw new Error('Falha ao iniciar sessão de compra');
    }
  },

  hydrate: (purchase) => {
    set({
      ...EMPTY_SESSION,
      isActive: true,
      isHydrating: false,
      purchaseId: purchase.id,
      storeId: purchase.storeId,
      storeName: purchase.storeName,
      items: purchase.items,
      ...recalculate(purchase.items),
      linkedListId: purchase.linkedList?.id ?? purchase.linkedListId ?? null,
      linkedListName: purchase.linkedList?.name ?? null,
      linkedListItems: purchase.linkedList?.items ?? [],
    });
  },

  syncFromServer: async () => {
    set({ isHydrating: true });
    try {
      const active = await purchaseRepository.getActive();
      if (active && active.status === 'active') {
        logger.info('Cart', 'Resuming active purchase', active.id);
        get().hydrate(active);
      } else if (get().isActive) {
        logger.info('Cart', 'Local session no longer active on server, resetting');
        set({ ...EMPTY_SESSION, isHydrating: false });
      } else {
        set({ isHydrating: false });
      }
    } catch (error) {
      // Sem rede: mantém o estado local como está.
      logger.warn('Cart', 'Could not sync active purchase', error);
      set({ isHydrating: false });
    }
  },

  cancelSession: async () => {
    const { purchaseId } = get();
    if (purchaseId) {
      await purchaseRepository.update(purchaseId, { status: 'cancelled' });
    }
    set({ ...EMPTY_SESSION });
  },

  addItem: (item) => {
    const { purchaseId, items } = get();
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
    const { purchaseId } = get();
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return { items: newItems, ...recalculate(newItems) };
    });
    if (purchaseId) {
      purchaseRepository.removeItem(purchaseId, itemId).catch(() => {});
    }
  },

  updateItemQuantity: (itemId, quantity) => {
    const { purchaseId } = get();
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

  linkList: (list) => {
    const { purchaseId } = get();
    set({ linkedListId: list.id, linkedListName: list.name, linkedListItems: list.items });
    if (purchaseId) {
      purchaseRepository.update(purchaseId, { linkedListId: list.id }).catch(() => {});
    }
  },

  unlinkList: () => {
    const { purchaseId } = get();
    set({ linkedListId: null, linkedListName: null, linkedListItems: [] });
    if (purchaseId) {
      purchaseRepository.update(purchaseId, { linkedListId: null }).catch(() => {});
    }
  },

  clearCart: () =>
    set({ items: [], total: 0, itemCount: 0 }),

  reset: () => set({ ...EMPTY_SESSION, isHydrating: false }),
}));
