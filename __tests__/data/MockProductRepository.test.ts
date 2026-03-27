import { MockProductRepository } from '@/data/repositories/mock/MockProductRepository';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

describe('MockProductRepository', () => {
  let repo: MockProductRepository;

  beforeEach(() => {
    repo = new MockProductRepository();
  });

  describe('searchByBarcode()', () => {
    it('returns the correct product for a known barcode', async () => {
      const product = await repo.searchByBarcode('7891093010014');
      expect(product).not.toBeNull();
      expect(product?.name).toBe('Arroz Branco Tipo 1 Tio João');
    });

    it('returns null for an unknown barcode', async () => {
      const product = await repo.searchByBarcode('0000000000000');
      expect(product).toBeNull();
    });
  });

  describe('getAll()', () => {
    it('returns paginated results respecting limit and page', async () => {
      const result = await repo.getAll({ page: 1, limit: 5 });
      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(30);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('returns the second page correctly', async () => {
      const result = await repo.getAll({ page: 2, limit: 5 });
      expect(result.data).toHaveLength(5);
      expect(result.page).toBe(2);
    });

    it('returns empty data when page exceeds total', async () => {
      const result = await repo.getAll({ page: 100, limit: 10 });
      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('filters by categoryId when categoryId param is provided', async () => {
      const result = await repo.getAll({ categoryId: 3 });
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((p) => expect(p.categoryId).toBe(3));
    });
  });

  describe('search()', () => {
    it('returns products matching name query (case-insensitive)', async () => {
      const result = await repo.search('arroz');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) =>
        expect(p.name.toLowerCase()).toContain('arroz'),
      );
    });

    it('returns empty array for a query with no matches', async () => {
      const result = await repo.search('produtoinexistente12345');
      expect(result).toHaveLength(0);
    });

    it('returns products matching brand query (case-insensitive)', async () => {
      const result = await repo.search('pilão');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getById()', () => {
    it('returns a product for a known id', async () => {
      const product = await repo.getById('prod-001');
      expect(product).not.toBeNull();
      expect(product?.id).toBe('prod-001');
    });

    it('returns null for an unknown id', async () => {
      const product = await repo.getById('unknown-id');
      expect(product).toBeNull();
    });
  });
});
