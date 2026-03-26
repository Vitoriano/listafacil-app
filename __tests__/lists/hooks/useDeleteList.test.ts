import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteList } from '@/features/lists/hooks/useDeleteList';

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

describe('useDeleteList', () => {
  it('mutation deletes a list without error', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteList(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate('list-001');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('invalidates ["lists"] query cache on success', async () => {
    const { client, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteList(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate('list-002');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });

    invalidateSpy.mockRestore();
  });
});
