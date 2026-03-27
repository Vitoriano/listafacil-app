import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type {
  UserWithStats,
  LoginCredentials,
  RegisterData,
  UpdateProfile,
  AuthResult,
  SavingsData,
} from '@/features/auth/types';
import seedUsers from '@/data/seed/users.json';

const MOCK_TOKEN_PREFIX = 'mock-jwt-token';

export class MockUserRepository implements IUserRepository {
  private store: InMemoryStore<UserWithStats>;
  private currentUserId: string | null;

  constructor() {
    this.store = new InMemoryStore<UserWithStats>(seedUsers as UserWithStats[]);
    this.currentUserId = 'user-001';
  }

  async getCurrentUser(): Promise<UserWithStats | null> {
    await simulateDelay();
    if (!this.currentUserId) return null;
    return this.store.getById(this.currentUserId);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await simulateDelay();

    const users = this.store.getAll();
    const user =
      users.find((u) => u.email === credentials.email) ?? users[0];

    this.currentUserId = user.id;

    return {
      user,
      accessToken: `${MOCK_TOKEN_PREFIX}-${user.id}-${Date.now()}`,
      refreshToken: `${MOCK_TOKEN_PREFIX}-refresh-${user.id}-${Date.now()}`,
    };
  }

  async register(data: RegisterData): Promise<AuthResult> {
    await simulateDelay();

    const newUser: UserWithStats = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name,
      email: data.email,
      avatarUrl: null,
      totalSubmissions: 0,
      totalSavings: 0,
      joinedAt: new Date().toISOString(),
    };

    this.store.create(newUser);
    this.currentUserId = newUser.id;

    return {
      user: newUser,
      accessToken: `${MOCK_TOKEN_PREFIX}-${newUser.id}-${Date.now()}`,
      refreshToken: `${MOCK_TOKEN_PREFIX}-refresh-${newUser.id}-${Date.now()}`,
    };
  }

  async updateProfile(data: UpdateProfile): Promise<UserWithStats> {
    await simulateDelay();

    if (!this.currentUserId) {
      throw new Error('Usuário não autenticado');
    }

    const updated = this.store.update(this.currentUserId, data);
    if (!updated) {
      throw new Error('Usuário não encontrado');
    }

    return updated;
  }

  async getSavings(): Promise<SavingsData> {
    await simulateDelay();

    const currentUser = this.currentUserId
      ? this.store.getById(this.currentUserId)
      : null;

    const totalSavings = currentUser?.totalSavings ?? 0;

    return {
      totalSavings,
      monthlySavings: [
        { month: '2025-10', amount: 45.80 },
        { month: '2025-11', amount: 62.30 },
        { month: '2025-12', amount: 78.50 },
        { month: '2026-01', amount: 55.20 },
        { month: '2026-02', amount: 71.00 },
        { month: '2026-03', amount: 38.60 },
      ],
      recentPurchases: [
        {
          listName: 'Compras da Semana',
          storeName: 'Atacadão',
          total: 87.43,
          savings: 18.50,
          date: '2026-03-22',
        },
        {
          listName: 'Itens do Mês',
          storeName: 'Assaí Atacadista',
          total: 112.30,
          savings: 24.60,
          date: '2026-03-15',
        },
        {
          listName: 'Churrasco do Final de Semana',
          storeName: 'Extra Hipermercado',
          total: 54.80,
          savings: 11.20,
          date: '2026-03-08',
        },
      ],
    };
  }
}
