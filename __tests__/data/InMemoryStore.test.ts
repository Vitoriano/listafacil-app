import { InMemoryStore } from '@/data/helpers/InMemoryStore';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

const seedItems: TestItem[] = [
  { id: 'a', name: 'Alpha', value: 1 },
  { id: 'b', name: 'Beta', value: 2 },
  { id: 'c', name: 'Gamma', value: 3 },
];

describe('InMemoryStore', () => {
  let store: InMemoryStore<TestItem>;

  beforeEach(() => {
    store = new InMemoryStore<TestItem>(seedItems);
  });

  describe('getAll()', () => {
    it('returns all seed items', () => {
      const all = store.getAll();
      expect(all).toHaveLength(3);
      expect(all.map((i) => i.id)).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });
  });

  describe('getById()', () => {
    it('returns the correct item by id', () => {
      const item = store.getById('b');
      expect(item).not.toBeNull();
      expect(item?.name).toBe('Beta');
    });

    it('returns null for an unknown id', () => {
      const item = store.getById('unknown');
      expect(item).toBeNull();
    });
  });

  describe('create()', () => {
    it('adds item and it is retrievable by getById', () => {
      const newItem: TestItem = { id: 'd', name: 'Delta', value: 4 };
      store.create(newItem);

      const retrieved = store.getById('d');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Delta');
    });

    it('increases the count after create', () => {
      expect(store.count()).toBe(3);
      store.create({ id: 'e', name: 'Epsilon', value: 5 });
      expect(store.count()).toBe(4);
    });
  });

  describe('update()', () => {
    it('merges partial data correctly', () => {
      const updated = store.update('a', { value: 99 });
      expect(updated).not.toBeNull();
      expect(updated?.value).toBe(99);
      expect(updated?.name).toBe('Alpha');
    });

    it('returns null for unknown id', () => {
      const result = store.update('unknown', { value: 99 });
      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('removes item and returns true', () => {
      const result = store.delete('a');
      expect(result).toBe(true);
      expect(store.getById('a')).toBeNull();
    });

    it('returns false for unknown id', () => {
      const result = store.delete('unknown');
      expect(result).toBe(false);
    });
  });

  describe('filter()', () => {
    it('returns subset matching predicate', () => {
      const result = store.filter((item) => item.value > 1);
      expect(result).toHaveLength(2);
      expect(result.map((i) => i.id)).toEqual(expect.arrayContaining(['b', 'c']));
    });

    it('returns empty array when no items match', () => {
      const result = store.filter((item) => item.value > 100);
      expect(result).toHaveLength(0);
    });
  });

  describe('count()', () => {
    it('returns correct item count after create/delete', () => {
      expect(store.count()).toBe(3);

      store.create({ id: 'new', name: 'New', value: 10 });
      expect(store.count()).toBe(4);

      store.delete('new');
      expect(store.count()).toBe(3);

      store.delete('a');
      expect(store.count()).toBe(2);
    });
  });
});
