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

    if (params.search) {
      const query = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query),
      );
    }

    if (params.category) {
      items = items.filter((p) => p.category === params.category);
    }

    if (params.sortBy === 'name') {
      items = items.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (params.sortBy === 'price') {
      items = items.slice().sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (params.sortBy === 'recent') {
      items = items
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
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
    const results = this.store.filter((p) => p.barcode === barcode);
    if (results[0]) return results[0];

    // Mock: gera um produto para qualquer barcode escaneado (simula backend)
    const mockProduct: Product = {
      id: `prod-scan-${barcode}`,
      name: `Produto ${barcode.slice(-4)}`,
      brand: 'Marca Genérica',
      barcode,
      category: 'other',
      unit: 'un',
      imageUrl: null,
      averagePrice: 9.9 + Math.random() * 20,
      lowestPrice: 5.9 + Math.random() * 10,
      priceCount: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date().toISOString(),
    };
    mockProduct.averagePrice = Math.round(mockProduct.averagePrice * 100) / 100;
    mockProduct.lowestPrice = Math.round(mockProduct.lowestPrice * 100) / 100;
    this.store.create(mockProduct);
    return mockProduct;
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
