import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IListRepository } from '../interfaces/IListRepository';
import type {
  ShoppingList,
  ListItem,
  CreateShoppingList,
  UpdateShoppingList,
  CreateListItem,
  UpdateListItem,
  OptimizationResult,
  StoreBreakdown,
} from '@/features/lists/types';
import type { Store } from '@/shared/types';
import seedLists from '@/data/seed/lists.json';
import seedStores from '@/data/seed/stores.json';
import seedPrices from '@/data/seed/prices.json';
import seedProducts from '@/data/seed/products.json';
import type { PriceEntry } from '@/features/prices/types';
import type { Product } from '@/features/products/types';

export class MockListRepository implements IListRepository {
  private store: InMemoryStore<ShoppingList>;

  constructor() {
    this.store = new InMemoryStore<ShoppingList>(
      seedLists as unknown as ShoppingList[],
    );
  }

  async getAll(): Promise<ShoppingList[]> {
    await simulateDelay();
    return this.store.getAll();
  }

  async getById(id: string): Promise<ShoppingList | null> {
    await simulateDelay();
    return this.store.getById(id);
  }

  async create(list: CreateShoppingList): Promise<ShoppingList> {
    await simulateDelay();
    const now = new Date().toISOString();
    const newList: ShoppingList = {
      id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: list.name,
      items: [],
      totalEstimate: 0,
      itemCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.create(newList);
  }

  async update(id: string, data: UpdateShoppingList): Promise<ShoppingList> {
    await simulateDelay();
    const updated = this.store.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      throw new Error(`Lista com id "${id}" não encontrada`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await simulateDelay();
    this.store.delete(id);
  }

  async addItem(listId: string, item: CreateListItem): Promise<ListItem> {
    await simulateDelay();

    const list = this.store.getById(listId);
    if (!list) {
      throw new Error(`Lista com id "${listId}" não encontrada`);
    }

    const products = seedProducts as Product[];
    const product = products.find((p) => p.id === item.productId);

    const newItem: ListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: item.productId,
      productName: product?.name ?? 'Produto',
      quantity: item.quantity,
      unit: product?.unit ?? 'un',
      estimatedPrice: product?.lowestPrice ?? 0,
      checked: false,
    };

    const updatedItems = [...list.items, newItem];
    const totalEstimate = updatedItems.reduce(
      (sum, i) => sum + i.estimatedPrice * i.quantity,
      0,
    );

    this.store.update(listId, {
      items: updatedItems,
      itemCount: updatedItems.length,
      totalEstimate: Math.round(totalEstimate * 100) / 100,
      updatedAt: new Date().toISOString(),
    });

    return newItem;
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    await simulateDelay();

    const list = this.store.getById(listId);
    if (!list) {
      throw new Error(`Lista com id "${listId}" não encontrada`);
    }

    const updatedItems = list.items.filter((i) => i.id !== itemId);
    const totalEstimate = updatedItems.reduce(
      (sum, i) => sum + i.estimatedPrice * i.quantity,
      0,
    );

    this.store.update(listId, {
      items: updatedItems,
      itemCount: updatedItems.length,
      totalEstimate: Math.round(totalEstimate * 100) / 100,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateItem(
    listId: string,
    itemId: string,
    data: UpdateListItem,
  ): Promise<ListItem> {
    await simulateDelay();

    const list = this.store.getById(listId);
    if (!list) {
      throw new Error(`Lista com id "${listId}" não encontrada`);
    }

    const itemIndex = list.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Item com id "${itemId}" não encontrado`);
    }

    const updatedItem: ListItem = { ...list.items[itemIndex], ...data };
    const updatedItems = list.items.map((i) =>
      i.id === itemId ? updatedItem : i,
    );
    const totalEstimate = updatedItems.reduce(
      (sum, i) => sum + i.estimatedPrice * i.quantity,
      0,
    );

    this.store.update(listId, {
      items: updatedItems,
      itemCount: updatedItems.length,
      totalEstimate: Math.round(totalEstimate * 100) / 100,
      updatedAt: new Date().toISOString(),
    });

    return updatedItem;
  }

  async optimize(listId: string): Promise<OptimizationResult> {
    await simulateDelay();

    const list = this.store.getById(listId);
    const stores = seedStores as Store[];
    const prices = seedPrices as PriceEntry[];

    const bestStore = stores[0];

    if (!list || list.items.length === 0) {
      return {
        bestStore,
        totalCost: 0,
        savings: 0,
        storeBreakdown: stores.slice(0, 3).map((store) => ({
          store,
          totalCost: 0,
          itemsAvailable: 0,
          itemsMissing: list?.items.length ?? 0,
        })),
      };
    }

    const storeMap = new Map<string, Store>(stores.map((s) => [s.id, s]));

    const storeIds = [...new Set(prices.map((p) => p.storeId))].slice(0, 5);

    const breakdowns: StoreBreakdown[] = storeIds
      .map((storeId) => {
        const store = storeMap.get(storeId);
        if (!store) return null;

        let totalCost = 0;
        let itemsAvailable = 0;

        for (const item of list.items) {
          const storePrices = prices.filter(
            (p) => p.productId === item.productId && p.storeId === storeId,
          );
          if (storePrices.length > 0) {
            const cheapest = Math.min(...storePrices.map((p) => p.price));
            totalCost += cheapest * item.quantity;
            itemsAvailable++;
          }
        }

        return {
          store,
          totalCost: Math.round(totalCost * 100) / 100,
          itemsAvailable,
          itemsMissing: list.items.length - itemsAvailable,
        };
      })
      .filter((b): b is StoreBreakdown => b !== null);

    breakdowns.sort((a, b) => a.totalCost - b.totalCost);

    const best = breakdowns[0] ?? {
      store: bestStore,
      totalCost: 0,
      itemsAvailable: 0,
      itemsMissing: list.items.length,
    };

    const averageTotalCost =
      breakdowns.length > 0
        ? breakdowns.reduce((sum, b) => sum + b.totalCost, 0) /
          breakdowns.length
        : best.totalCost;

    const savings =
      Math.round((averageTotalCost - best.totalCost) * 100) / 100;

    return {
      bestStore: best.store,
      totalCost: best.totalCost,
      savings: Math.max(0, savings),
      storeBreakdown: breakdowns,
    };
  }
}
