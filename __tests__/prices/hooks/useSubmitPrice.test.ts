import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubmitPrice } from '@/features/prices/hooks/useSubmitPrice';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  });
  return { client, Wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  }};
}

describe('useSubmitPrice', () => {
  it('mutation creates a new PriceEntry', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSubmitPrice(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        productId: 'prod-001',
        storeId: 'store-001',
        price: 24.99,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.productId).toBe('prod-001');
    expect(result.current.data?.price).toBe(24.99);
  });

  it('invalidates [prices, productId] and [products, productId] query caches on success', async () => {
    const { client, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');

    const { result } = renderHook(() => useSubmitPrice(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        productId: 'prod-001',
        storeId: 'store-002',
        price: 20.0,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['prices', 'prod-001'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products', 'prod-001'] });

    invalidateSpy.mockRestore();
  });
});
