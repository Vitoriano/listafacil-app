import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile } from '@/features/profile/hooks/useProfile';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
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

describe('useProfile', () => {
  it('returns the current user from the repository', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // MockUserRepository initializes currentUserId to 'user-001'
    expect(result.current.data).not.toBeNull();
    expect(result.current.data).toHaveProperty('id');
    expect(result.current.data).toHaveProperty('name');
    expect(result.current.data).toHaveProperty('email');
    expect(result.current.data).toHaveProperty('totalSubmissions');
    expect(result.current.data).toHaveProperty('totalSavings');
  });

  it('query uses [user, current] key', async () => {
    const { client, Wrapper } = createWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data is cached under the correct key
    const cachedData = client.getQueryData(['user', 'current']);
    expect(cachedData).toBeDefined();
  });
});
