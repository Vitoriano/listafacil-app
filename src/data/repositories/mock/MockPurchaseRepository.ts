import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IPurchaseRepository } from '../interfaces/IPurchaseRepository';
import type { Purchase } from '@/features/cart/types';
import seedPurchases from '@/data/seed/purchases.json';

export class MockPurchaseRepository implements IPurchaseRepository {
  private store: InMemoryStore<Purchase>;

  constructor() {
    this.store = new InMemoryStore<Purchase>(seedPurchases as Purchase[]);
  }

  async getAll(): Promise<Purchase[]> {
    await simulateDelay();
    return this.store
      .getAll()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getById(id: string): Promise<Purchase | null> {
    await simulateDelay();
    return this.store.getById(id);
  }

  async create(purchase: Purchase): Promise<Purchase> {
    await simulateDelay();
    return this.store.create(purchase);
  }

  async update(id: string, data: Partial<Purchase>): Promise<Purchase | null> {
    await simulateDelay();
    return this.store.update(id, data);
  }

  async getRecent(limit: number = 5): Promise<Purchase[]> {
    await simulateDelay();
    return this.store
      .getAll()
      .filter((p) => p.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}
