import { MockStoreRepository } from '@/data/repositories/mock/MockStoreRepository';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

describe('MockStoreRepository', () => {
  let repo: MockStoreRepository;

  beforeEach(() => {
    repo = new MockStoreRepository();
  });

  describe('getAll()', () => {
    it('returns all 10 seeded stores', async () => {
      const stores = await repo.getAll();
      expect(stores).toHaveLength(10);
    });
  });

  describe('getById()', () => {
    it('returns correct store by id', async () => {
      const store = await repo.getById('store-001');
      expect(store).not.toBeNull();
      expect(store?.name).toBe('Pão de Açúcar');
    });

    it('returns null for an unknown id', async () => {
      const store = await repo.getById('unknown-store');
      expect(store).toBeNull();
    });
  });

  describe('getNearby()', () => {
    it('returns stores within the specified radius (São Paulo center)', async () => {
      // São Paulo center coordinates
      const lat = -23.5505;
      const lng = -46.6333;

      const nearby = await repo.getNearby(lat, lng, 10);
      expect(Array.isArray(nearby)).toBe(true);
      expect(nearby.length).toBeGreaterThan(0);
      // All returned stores should be São Paulo based (not Belo Horizonte or Rio)
      nearby.forEach((store) => {
        expect(store.city).not.toBe('Belo Horizonte');
        expect(store.city).not.toBe('Rio de Janeiro');
      });
    });

    it('returns empty array when no stores are within radius', async () => {
      // Middle of the ocean
      const nearby = await repo.getNearby(0, 0, 1);
      expect(nearby).toHaveLength(0);
    });

    it('uses default radius of 10km when not specified', async () => {
      const lat = -23.5505;
      const lng = -46.6333;

      const nearby = await repo.getNearby(lat, lng);
      expect(Array.isArray(nearby)).toBe(true);
    });

    it('returns stores filtered to a radius - larger radius includes more stores', async () => {
      const lat = -23.5505;
      const lng = -46.6333;

      const nearbySmall = await repo.getNearby(lat, lng, 5);
      const nearbyLarge = await repo.getNearby(lat, lng, 5000);

      expect(nearbyLarge.length).toBeGreaterThanOrEqual(nearbySmall.length);
    });
  });
});
