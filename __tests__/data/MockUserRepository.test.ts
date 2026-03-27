import { MockUserRepository } from '@/data/repositories/mock/MockUserRepository';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

describe('MockUserRepository', () => {
  let repo: MockUserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
  });

  describe('login()', () => {
    it('always returns an AuthResult with user and token for valid-format credentials', async () => {
      const result = await repo.login({
        email: 'maria.silva@email.com',
        password: 'any-password',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
    });

    it('returns an AuthResult for unknown email (falls back to first user)', async () => {
      const result = await repo.login({
        email: 'unknown@email.com',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('getCurrentUser()', () => {
    it('returns the current user after initialization', async () => {
      const user = await repo.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user-001');
    });
  });

  describe('register()', () => {
    it('creates a new user and returns an AuthResult', async () => {
      const result = await repo.register({
        name: 'Carlos Pereira',
        email: 'carlos@email.com',
        password: 'senha123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Carlos Pereira');
      expect(result.user.email).toBe('carlos@email.com');
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('getSavings()', () => {
    it('returns SavingsData with monthlySavings and recentPurchases', async () => {
      const savings = await repo.getSavings();

      expect(savings).toBeDefined();
      expect(typeof savings.totalSavings).toBe('number');
      expect(Array.isArray(savings.monthlySavings)).toBe(true);
      expect(savings.monthlySavings.length).toBeGreaterThan(0);
      expect(Array.isArray(savings.recentPurchases)).toBe(true);
      expect(savings.recentPurchases.length).toBeGreaterThan(0);

      savings.monthlySavings.forEach((ms) => {
        expect(typeof ms.month).toBe('string');
        expect(typeof ms.amount).toBe('number');
      });

      savings.recentPurchases.forEach((rp) => {
        expect(typeof rp.listName).toBe('string');
        expect(typeof rp.storeName).toBe('string');
        expect(typeof rp.total).toBe('number');
        expect(typeof rp.savings).toBe('number');
      });
    });
  });

  describe('updateProfile()', () => {
    it('updates the current user profile', async () => {
      const updated = await repo.updateProfile({ name: 'Maria Silva Santos' });
      expect(updated.name).toBe('Maria Silva Santos');
    });
  });
});
