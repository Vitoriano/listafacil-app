import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useListDetail } from '@/features/lists/hooks/useListDetail';

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

describe('useListDetail', () => {
  it('returns correct ShoppingList for a known id (list-001)', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useListDetail('list-001'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.id).toBe('list-001');
    expect(result.current.data?.name).toBe('Compras da Semana');
    expect(result.current.data?.items.length).toBeGreaterThan(0);
  });

  it('returns null for an unknown id', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useListDetail('unknown-list-id'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('does not fetch when listId is null', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useListDetail(null), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
