import type { Store } from '@/shared/types';

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
  totalEstimate: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  checked: boolean;
}

export interface CreateShoppingList {
  name: string;
}

export interface UpdateShoppingList {
  name?: string;
}

export interface CreateListItem {
  productId: string;
  quantity: number;
}

export interface UpdateListItem {
  quantity?: number;
  checked?: boolean;
}

export interface OptimizationResult {
  bestStore: Store;
  totalCost: number;
  savings: number;
  storeBreakdown: StoreBreakdown[];
}

export interface StoreBreakdown {
  store: Store;
  totalCost: number;
  itemsAvailable: number;
  itemsMissing: number;
}

// ── Sharing ──

export type ShareRole = 'editor' | 'viewer';

export interface SharedMember {
  userId: string;
  name: string;
  email: string;
  role: ShareRole;
  joinedAt: string;
}

export interface ShareInvite {
  id: string;
  listId: string;
  listName: string;
  invitedBy: string;
  role: ShareRole;
  createdAt: string;
  expiresAt: string;
}

export interface ShareByEmailData {
  listId: string;
  email: string;
  role: ShareRole;
}

export interface ShareResult {
  invite: ShareInvite;
  shareUrl: string;
}
