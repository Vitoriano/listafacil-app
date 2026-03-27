import { api } from '@/config/api';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type {
  UserWithStats,
  LoginCredentials,
  RegisterData,
  UpdateProfile,
  AuthResult,
  SavingsData,
} from '@/features/auth/types';

export class ApiUserRepository implements IUserRepository {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  }

  async register(registerData: RegisterData): Promise<AuthResult> {
    const { data } = await api.post('/auth/register', registerData);
    return data;
  }

  async getCurrentUser(): Promise<UserWithStats | null> {
    const { data } = await api.get('/users/me');
    return data;
  }

  async updateProfile(profileData: UpdateProfile): Promise<UserWithStats> {
    const { data } = await api.patch('/users/me', profileData);
    return data;
  }

  async getSavings(): Promise<SavingsData> {
    const { data } = await api.get('/users/me/savings');
    return data;
  }
}
