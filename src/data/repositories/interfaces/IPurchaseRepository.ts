import type { Purchase } from '@/features/cart/types';

export interface IPurchaseRepository {
  getAll(): Promise<Purchase[]>;
  getById(id: string): Promise<Purchase | null>;
  create(purchase: Purchase): Promise<Purchase>;
  update(id: string, data: Partial<Purchase>): Promise<Purchase | null>;
  getRecent(limit?: number): Promise<Purchase[]>;
}
