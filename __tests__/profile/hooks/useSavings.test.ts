import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSavings } from '@/features/profile/hooks/useSavings';

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

describe('useSavings', () => {
  it('returns SavingsData with monthlySavings array and recentPurchases array', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSavings(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data?.monthlySavings)).toBe(true);
    expect(Array.isArray(result.current.data?.recentPurchases)).toBe(true);
  });

  it('savings values are valid numbers', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSavings(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(typeof result.current.data?.totalSavings).toBe('number');
    result.current.data?.monthlySavings.forEach((m) => {
      expect(typeof m.amount).toBe('number');
      expect(m.amount).toBeGreaterThanOrEqual(0);
    });
    result.current.data?.recentPurchases.forEach((p) => {
      expect(typeof p.total).toBe('number');
      expect(typeof p.savings).toBe('number');
    });
  });

  it('returns 6 monthly savings entries from seed data', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSavings(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.monthlySavings.length).toBe(6);
  });

  it('returns 3 recent purchases from seed data', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSavings(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.recentPurchases.length).toBe(3);
  });
});
