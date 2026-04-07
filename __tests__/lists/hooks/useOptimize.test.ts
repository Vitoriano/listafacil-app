import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimize } from '@/features/lists/hooks/useOptimize';

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

describe('useOptimize', () => {
  it('returns OptimizationResult with bestStore and stores for list-001', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOptimize('list-001'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.bestStore).toBeDefined();
    expect(result.current.data?.bestStore.storeId).toBeTruthy();
    expect(Array.isArray(result.current.data?.stores)).toBe(true);
  });

  it('returns totalCost and savings on bestStore', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOptimize('list-001'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(typeof result.current.data?.bestStore.totalCost).toBe('number');
    expect(typeof result.current.data?.bestStore.savings).toBe('number');
  });

  it('does not fetch when listId is null', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOptimize(null), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
