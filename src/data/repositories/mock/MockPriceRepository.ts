import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IPriceRepository } from '../interfaces/IPriceRepository';
import type {
  PriceEntry,
  CreatePriceEntry,
  PriceQueryParams,
  PriceComparison,
  PriceHistoryPoint,
} from '@/features/prices/types';
import type { Paginated, Store } from '@/shared/types';
import { PAGINATION_LIMIT } from '@/config/constants';
import seedPrices from '@/data/seed/prices.json';
import seedProducts from '@/data/seed/products.json';
import seedStores from '@/data/seed/stores.json';
import type { Product } from '@/features/products/types';

export class MockPriceRepository implements IPriceRepository {
  private store: InMemoryStore<PriceEntry>;

  constructor() {
    this.store = new InMemoryStore<PriceEntry>(seedPrices as PriceEntry[]);
  }

  async getByProduct(
    productId: string,
    params?: PriceQueryParams,
  ): Promise<Paginated<PriceEntry>> {
    await simulateDelay();

    const items = this.store.filter((p) => p.productId === productId);
    const page = params?.page ?? 1;
    const limit = params?.limit ?? PAGINATION_LIMIT;
    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return { data, total, page, limit, hasMore: start + limit < total };
  }

  async getComparison(productId: string): Promise<PriceComparison> {
    await simulateDelay();

    const products = seedProducts as Product[];
    const product = products.find((p) => p.id === productId);
    const productName = product?.name ?? 'Produto';

    const entries = this.store
      .filter((p) => p.productId === productId)
      .sort((a, b) => a.price - b.price);

    const prices = entries.map((e) => e.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;
    const storeCount = new Set(entries.map((e) => e.storeId)).size;

    return {
      productId,
      productName,
      entries,
      lowestPrice,
      highestPrice,
      averagePrice: Math.round(averagePrice * 100) / 100,
      storeCount,
    };
  }

  async getHistory(
    productId: string,
    storeId?: string,
  ): Promise<PriceHistoryPoint[]> {
    await simulateDelay();

    let entries = this.store.filter((p) => p.productId === productId);
    if (storeId) {
      entries = entries.filter((p) => p.storeId === storeId);
    }

    return entries
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      )
      .map((e) => ({
        date: e.submittedAt.split('T')[0],
        price: e.price,
        storeId: e.storeId,
        storeName: e.storeName,
      }));
  }

  async submit(entry: CreatePriceEntry): Promise<PriceEntry> {
    await simulateDelay();

    const stores = seedStores as Store[];
    const store = stores.find((s) => s.id === entry.storeId);

    const newEntry: PriceEntry = {
      id: `price-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: entry.productId,
      storeId: entry.storeId,
      storeName: store?.name ?? 'Loja',
      price: entry.price,
      userId: 'user-001',
      submittedAt: new Date().toISOString(),
      validations: 0,
      isValid: true,
    };

    return this.store.create(newEntry);
  }

  async validate(priceId: string, isValid: boolean): Promise<void> {
    await simulateDelay();

    const entry = this.store.getById(priceId);
    if (entry) {
      this.store.update(priceId, {
        validations: entry.validations + 1,
        isValid,
      });
    }
  }
}
