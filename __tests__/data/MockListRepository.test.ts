import { MockListRepository } from '@/data/repositories/mock/MockListRepository';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

describe('MockListRepository', () => {
  let repo: MockListRepository;

  beforeEach(() => {
    repo = new MockListRepository();
  });

  describe('create()', () => {
    it('creates a new empty shopping list', async () => {
      const list = await repo.create({ name: 'Minha Nova Lista' });

      expect(list).toBeDefined();
      expect(list.id).toBeDefined();
      expect(list.name).toBe('Minha Nova Lista');
      expect(list.items).toHaveLength(0);
      expect(list.itemCount).toBe(0);
      expect(list.totalEstimate).toBe(0);
    });

    it('new list is retrievable via getById', async () => {
      const list = await repo.create({ name: 'Lista Teste' });
      const retrieved = await repo.getById(list.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Lista Teste');
    });
  });

  describe('addItem()', () => {
    it('appends item to existing list', async () => {
      const list = await repo.create({ name: 'Lista com Item' });
      const item = await repo.addItem(list.id, {
        productId: 'prod-001',
        quantity: 2,
      });

      expect(item).toBeDefined();
      expect(item.productId).toBe('prod-001');
      expect(item.quantity).toBe(2);
      expect(item.checked).toBe(false);

      const updated = await repo.getById(list.id);
      expect(updated?.items).toHaveLength(1);
      expect(updated?.itemCount).toBe(1);
    });

    it('updates totalEstimate when item is added', async () => {
      const list = await repo.create({ name: 'Lista Estimativa' });
      await repo.addItem(list.id, { productId: 'prod-001', quantity: 1 });

      const updated = await repo.getById(list.id);
      expect(updated?.totalEstimate).toBeGreaterThan(0);
    });
  });

  describe('removeItem()', () => {
    it('removes an item from the list', async () => {
      const list = await repo.create({ name: 'Lista Remover' });
      const item = await repo.addItem(list.id, {
        productId: 'prod-001',
        quantity: 1,
      });

      await repo.removeItem(list.id, item.id);

      const updated = await repo.getById(list.id);
      expect(updated?.items).toHaveLength(0);
      expect(updated?.itemCount).toBe(0);
    });
  });

  describe('updateItem()', () => {
    it('updates item quantity and checked status', async () => {
      const list = await repo.create({ name: 'Lista Update Item' });
      const item = await repo.addItem(list.id, {
        productId: 'prod-001',
        quantity: 1,
      });

      const updated = await repo.updateItem(list.id, item.id, {
        quantity: 3,
        checked: true,
      });

      expect(updated.quantity).toBe(3);
      expect(updated.checked).toBe(true);
    });
  });

  describe('optimize()', () => {
    it('returns an OptimizationResult with bestStore and stores fields populated', async () => {
      const result = await repo.optimize('list-001');

      expect(result).toBeDefined();
      expect(result.bestStore).toBeDefined();
      expect(result.bestStore.storeId).toBeDefined();
      expect(result.bestStore.storeName).toBeDefined();
      expect(typeof result.bestStore.savings).toBe('number');
      expect(result.bestStore.savings).toBeGreaterThanOrEqual(0);
      expect(typeof result.bestStore.totalCost).toBe('number');
      expect(result.stores).toBeDefined();
      expect(Array.isArray(result.stores)).toBe(true);
    });

    it('returns empty optimization for an empty list', async () => {
      const list = await repo.create({ name: 'Lista Vazia' });
      const result = await repo.optimize(list.id);

      expect(result).toBeDefined();
      expect(result.bestStore.totalCost).toBe(0);
      expect(result.bestStore.savings).toBe(0);
    });
  });

  describe('getAll()', () => {
    it('returns all seed lists', async () => {
      const lists = await repo.getAll();
      expect(lists.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('update()', () => {
    it('updates list name', async () => {
      const list = await repo.create({ name: 'Nome Original' });
      const updated = await repo.update(list.id, { name: 'Nome Atualizado' });
      expect(updated.name).toBe('Nome Atualizado');
    });
  });

  describe('delete()', () => {
    it('removes list from the store', async () => {
      const list = await repo.create({ name: 'Lista para Deletar' });
      await repo.delete(list.id);
      const retrieved = await repo.getById(list.id);
      expect(retrieved).toBeNull();
    });
  });
});
