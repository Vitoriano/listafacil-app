import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateItem } from '@/features/lists/hooks/useUpdateItem';

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

describe('useUpdateItem', () => {
  it('mutation updates item checked state and returns updated ListItem', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateItem(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        listId: 'list-001',
        itemId: 'item-001',
        data: { checked: true },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.checked).toBe(true);
  });

  it('mutation updates item quantity', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateItem(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        listId: 'list-001',
        itemId: 'item-002',
        data: { quantity: 5 },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.quantity).toBe(5);
  });

  it('invalidates ["lists", listId] query cache on success', async () => {
    const { client, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateItem(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        listId: 'list-001',
        itemId: 'item-001',
        data: { checked: true },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-001'],
    });

    invalidateSpy.mockRestore();
  });
});
