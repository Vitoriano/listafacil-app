import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfile,
  AuthResult,
  SavingsData,
} from '@/features/auth/types';

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  updateProfile(data: UpdateProfile): Promise<User>;
  getSavings(): Promise<SavingsData>;
}
