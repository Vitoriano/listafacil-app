import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLists } from '@/features/lists/hooks/useLists';

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

describe('useLists', () => {
  it('returns ShoppingList array resolved with seed data', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLists(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThanOrEqual(3);
  });

  it('returns lists with expected shape (id, name, items, totalEstimate, itemCount)', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLists(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const first = result.current.data![0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('items');
    expect(first).toHaveProperty('totalEstimate');
    expect(first).toHaveProperty('itemCount');
    expect(first).toHaveProperty('createdAt');
  });
});
