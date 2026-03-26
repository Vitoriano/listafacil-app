export class InMemoryStore<T extends { id: string }> {
  private items: Map<string, T>;

  constructor(seedData: T[]) {
    this.items = new Map(seedData.map((item) => [item.id, item]));
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }

  getById(id: string): T | null {
    return this.items.get(id) ?? null;
  }

  create(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  update(id: string, data: Partial<T>): T | null {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  count(): number {
    return this.items.size;
  }
}
