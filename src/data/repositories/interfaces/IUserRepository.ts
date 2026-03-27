import type {
  UserWithStats,
  LoginCredentials,
  RegisterData,
  UpdateProfile,
  AuthResult,
  SavingsData,
} from '@/features/auth/types';

export interface IUserRepository {
  getCurrentUser(): Promise<UserWithStats | null>;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  updateProfile(data: UpdateProfile): Promise<UserWithStats>;
  getSavings(): Promise<SavingsData>;
}
