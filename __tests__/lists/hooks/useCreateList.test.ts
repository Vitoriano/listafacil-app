import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateList } from '@/features/lists/hooks/useCreateList';

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

describe('useCreateList', () => {
  it('mutation creates a new ShoppingList', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateList(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Test List' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.name).toBe('Test List');
    expect(result.current.data?.items).toEqual([]);
  });

  it('invalidates ["lists"] query cache on success', async () => {
    const { client, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useCreateList(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ name: 'Another List' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });

    invalidateSpy.mockRestore();
  });
});
