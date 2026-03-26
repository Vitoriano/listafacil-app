import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddItem } from '@/features/lists/hooks/useAddItem';

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

describe('useAddItem', () => {
  it('mutation adds item to list and returns ListItem', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useAddItem(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        listId: 'list-001',
        item: { productId: 'prod-001', quantity: 2 },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.productId).toBe('prod-001');
    expect(result.current.data?.quantity).toBe(2);
  });

  it('invalidates ["lists", listId] query cache on success', async () => {
    const { client, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useAddItem(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        listId: 'list-002',
        item: { productId: 'prod-003', quantity: 1 },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-002'],
    });

    invalidateSpy.mockRestore();
  });
});
