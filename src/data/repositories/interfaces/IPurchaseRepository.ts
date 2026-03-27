import type {
  Purchase,
  PurchaseItem,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  AddPurchaseItemPayload,
  UpdatePurchaseItemPayload,
} from '@/features/cart/types';

export interface IPurchaseRepository {
  getAll(): Promise<Purchase[]>;
  getById(id: string): Promise<Purchase | null>;
  create(payload: CreatePurchasePayload): Promise<Purchase>;
  update(id: string, payload: UpdatePurchasePayload): Promise<Purchase | null>;
  getRecent(limit?: number): Promise<Purchase[]>;
  addItem(purchaseId: string, item: AddPurchaseItemPayload): Promise<PurchaseItem>;
  updateItem(purchaseId: string, itemId: string, data: UpdatePurchaseItemPayload): Promise<PurchaseItem>;
  removeItem(purchaseId: string, itemId: string): Promise<void>;
}
