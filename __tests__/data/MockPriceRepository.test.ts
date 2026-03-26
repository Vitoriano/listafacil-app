import { MockPriceRepository } from '@/data/repositories/mock/MockPriceRepository';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

describe('MockPriceRepository', () => {
  let repo: MockPriceRepository;

  beforeEach(() => {
    repo = new MockPriceRepository();
  });

  describe('submit()', () => {
    it('creates a new PriceEntry in memory and returns it', async () => {
      const entry = await repo.submit({
        productId: 'prod-001',
        storeId: 'store-001',
        price: 25.99,
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.productId).toBe('prod-001');
      expect(entry.storeId).toBe('store-001');
      expect(entry.price).toBe(25.99);
      expect(entry.validations).toBe(0);
      expect(entry.isValid).toBe(true);

      const byProduct = await repo.getByProduct('prod-001');
      const found = byProduct.data.find((p) => p.id === entry.id);
      expect(found).toBeDefined();
    });
  });

  describe('getComparison()', () => {
    it('returns entries sorted by price ascending', async () => {
      const comparison = await repo.getComparison('prod-001');
      expect(comparison.productId).toBe('prod-001');
      expect(comparison.entries.length).toBeGreaterThan(1);

      for (let i = 1; i < comparison.entries.length; i++) {
        expect(comparison.entries[i].price).toBeGreaterThanOrEqual(
          comparison.entries[i - 1].price,
        );
      }
    });

    it('returns correct lowestPrice and highestPrice', async () => {
      const comparison = await repo.getComparison('prod-001');
      const prices = comparison.entries.map((e) => e.price);
      expect(comparison.lowestPrice).toBe(Math.min(...prices));
      expect(comparison.highestPrice).toBe(Math.max(...prices));
    });
  });

  describe('getByProduct()', () => {
    it('returns paginated price entries for a product', async () => {
      const result = await repo.getByProduct('prod-001');
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((p) => expect(p.productId).toBe('prod-001'));
    });

    it('returns empty data for an unknown productId', async () => {
      const result = await repo.getByProduct('unknown-product');
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getHistory()', () => {
    it('returns history points sorted chronologically', async () => {
      const history = await repo.getHistory('prod-001');
      expect(history.length).toBeGreaterThan(0);
      for (let i = 1; i < history.length; i++) {
        expect(new Date(history[i].date).getTime()).toBeGreaterThanOrEqual(
          new Date(history[i - 1].date).getTime(),
        );
      }
    });
  });

  describe('validate()', () => {
    it('increments validations count for a known price', async () => {
      const byProduct = await repo.getByProduct('prod-001');
      const priceEntry = byProduct.data[0];
      const originalValidations = priceEntry.validations;

      await repo.validate(priceEntry.id, true);

      const updated = (await repo.getByProduct('prod-001')).data.find(
        (p) => p.id === priceEntry.id,
      );
      expect(updated?.validations).toBe(originalValidations + 1);
    });
  });
});
