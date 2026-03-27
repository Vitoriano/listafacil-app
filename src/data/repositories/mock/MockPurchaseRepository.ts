import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IPurchaseRepository } from '../interfaces/IPurchaseRepository';
import type {
  Purchase,
  PurchaseItem,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  AddPurchaseItemPayload,
  UpdatePurchaseItemPayload,
} from '@/features/cart/types';
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

  async create(payload: CreatePurchasePayload): Promise<Purchase> {
    await simulateDelay();
    const purchase: Purchase = {
      id: `purchase-${Date.now()}`,
      storeId: payload.storeId,
      storeName: 'Loja Mock',
      date: new Date().toISOString(),
      items: [],
      total: 0,
      itemCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    return this.store.create(purchase);
  }

  async update(id: string, payload: UpdatePurchasePayload): Promise<Purchase | null> {
    await simulateDelay();
    const updates: Partial<Purchase> = { status: payload.status };
    if (payload.status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    return this.store.update(id, updates);
  }

  async getRecent(limit: number = 5): Promise<Purchase[]> {
    await simulateDelay();
    return this.store
      .getAll()
      .filter((p) => p.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async addItem(purchaseId: string, item: AddPurchaseItemPayload): Promise<PurchaseItem> {
    await simulateDelay();
    const purchase = this.store.getById(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    const newItem: PurchaseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: item.productId,
      productName: 'Produto Mock',
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity ?? 1,
      fromListId: item.fromListId,
    };

    purchase.items.push(newItem);
    purchase.total = purchase.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    purchase.itemCount = purchase.items.reduce((sum, i) => sum + i.quantity, 0);
    this.store.update(purchaseId, purchase);
    return newItem;
  }

  async updateItem(
    purchaseId: string,
    itemId: string,
    data: UpdatePurchaseItemPayload,
  ): Promise<PurchaseItem> {
    await simulateDelay();
    const purchase = this.store.getById(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    const item = purchase.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    if (data.price !== undefined) item.price = data.price;
    if (data.quantity !== undefined) item.quantity = data.quantity;

    purchase.total = purchase.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    purchase.itemCount = purchase.items.reduce((sum, i) => sum + i.quantity, 0);
    this.store.update(purchaseId, purchase);
    return item;
  }

  async removeItem(purchaseId: string, itemId: string): Promise<void> {
    await simulateDelay();
    const purchase = this.store.getById(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    purchase.items = purchase.items.filter((i) => i.id !== itemId);
    purchase.total = purchase.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    purchase.itemCount = purchase.items.reduce((sum, i) => sum + i.quantity, 0);
    this.store.update(purchaseId, purchase);
  }
}
