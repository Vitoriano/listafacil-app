import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IProductRepository } from '../interfaces/IProductRepository';
import type { Product, ProductQueryParams } from '@/features/products/types';
import type { Paginated } from '@/shared/types';
import { PAGINATION_LIMIT } from '@/config/constants';
import seedProducts from '@/data/seed/products.json';

export class MockProductRepository implements IProductRepository {
  private store: InMemoryStore<Product>;

  constructor() {
    this.store = new InMemoryStore<Product>(seedProducts as Product[]);
  }

  async getAll(params: ProductQueryParams): Promise<Paginated<Product>> {
    await simulateDelay();

    let items = this.store.getAll();

    if (params.q) {
      const query = params.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query),
      );
    }

    if (params.categoryId) {
      items = items.filter((p) => p.categoryId === params.categoryId);
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? PAGINATION_LIMIT;
    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      hasMore: start + limit < total,
    };
  }

  async getById(id: string): Promise<Product | null> {
    await simulateDelay();
    return this.store.getById(id);
  }

  async searchByBarcode(barcode: string): Promise<Product | null> {
    await simulateDelay();
    return this.store.filter((p) => p.barcode === barcode)[0] ?? null;
  }

  async search(query: string): Promise<Product[]> {
    await simulateDelay();
    const q = query.toLowerCase();
    return this.store.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }
}
