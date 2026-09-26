import type { ListItem } from '@/features/lists/types';

export type PurchaseStatus = 'active' | 'completed' | 'cancelled';

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  price: number;
  quantity: number;
  fromListId?: string;
}

/** Lista vinculada a uma compra, como devolvida pela API em GET /purchases/active. */
export interface LinkedListSnapshot {
  id: string;
  name: string;
  items: ListItem[];
}

export interface Purchase {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  itemCount: number;
  status: PurchaseStatus;
  createdAt: string;
  completedAt: string | null;
  linkedListId?: string | null;
  linkedList?: LinkedListSnapshot | null;
}

export interface CreatePurchasePayload {
  storeId: string;
  linkedListId?: string;
}

export interface UpdatePurchasePayload {
  status?: 'completed' | 'cancelled';
  /** uuid para vincular, null para desvincular. */
  linkedListId?: string | null;
}

export interface AddPurchaseItemPayload {
  productId: string;
  barcode: string;
  price: number;
  quantity?: number;
  fromListId?: string;
}

export interface UpdatePurchaseItemPayload {
  price?: number;
  quantity?: number;
}
