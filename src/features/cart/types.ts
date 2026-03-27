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
}

export interface CreatePurchasePayload {
  storeId: string;
  linkedListId?: string;
}

export interface UpdatePurchasePayload {
  status: 'completed' | 'cancelled';
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
