import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/stores/authStore';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  });
  return {
    client,
    Wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client }, children);
    },
  };
}

describe('useAuth', () => {
  beforeEach(() => {
    // Reset authStore state before each test
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  describe('login mutation', () => {
    it('returns AuthResult with user and accessToken', async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await act(async () => {
        result.current.login.mutate({
          email: 'maria.silva@email.com',
          password: 'password123',
        });
      });

      await waitFor(() => expect(result.current.login.isSuccess).toBe(true));

      expect(result.current.login.data).toBeDefined();
      expect(result.current.login.data?.user).toBeDefined();
      expect(result.current.login.data?.accessToken).toBeDefined();
      expect(typeof result.current.login.data?.accessToken).toBe('string');
    });

    it('updates authStore on success (user and accessToken stored)', async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await act(async () => {
        result.current.login.mutate({
          email: 'maria.silva@email.com',
          password: 'password123',
        });
      });

      await waitFor(() => expect(result.current.login.isSuccess).toBe(true));

      const { user, accessToken } = useAuthStore.getState();
      expect(user).not.toBeNull();
      expect(accessToken).not.toBeNull();
      expect(typeof accessToken).toBe('string');
    });
  });

  describe('register mutation', () => {
    it('creates a new user and returns AuthResult', async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await act(async () => {
        result.current.register.mutate({
          name: 'João Novo',
          email: 'joao.novo@email.com',
          password: 'newpassword123',
        });
      });

      await waitFor(() => expect(result.current.register.isSuccess).toBe(true));

      expect(result.current.register.data).toBeDefined();
      expect(result.current.register.data?.user.name).toBe('João Novo');
      expect(result.current.register.data?.user.email).toBe(
        'joao.novo@email.com',
      );
      expect(result.current.register.data?.accessToken).toBeDefined();
    });

    it('updates authStore on success', async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

      await act(async () => {
        result.current.register.mutate({
          name: 'Ana Costa',
          email: 'ana.costa@email.com',
          password: 'securepass123',
        });
      });

      await waitFor(() => expect(result.current.register.isSuccess).toBe(true));

      const { user, accessToken } = useAuthStore.getState();
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Ana Costa');
      expect(accessToken).not.toBeNull();
    });
  });
});
