export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface UserWithStats extends User {
  totalSubmissions: number;
  totalSavings: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfile {
  name?: string;
  avatarUrl?: string | null;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SavingsData {
  totalSavings: number;
  monthlySavings: MonthlySaving[];
  recentPurchases: RecentPurchase[];
}

export interface MonthlySaving {
  month: string;
  amount: number;
}

export interface RecentPurchase {
  listName: string;
  storeName: string;
  total: number;
  savings: number;
  date: string;
}
