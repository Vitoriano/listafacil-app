import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrices } from '@/features/prices/hooks/usePrices';

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('usePrices', () => {
  it('returns paginated PriceEntry[] for a known productId', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePrices('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.data.length).toBeGreaterThan(0);
    result.current.data?.data.forEach((entry) => {
      expect(entry.productId).toBe('prod-001');
    });
  });

  it('returns empty data for unknown productId', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePrices('unknown-product-id'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.data?.data).toHaveLength(0);
    expect(result.current.data?.total).toBe(0);
  });

  it('is disabled when productId is null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePrices(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('uses query key [prices, productId, params]', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: 0 } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);

    const { result } = renderHook(() => usePrices('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const queries = client.getQueryCache().findAll();
    const queryKey = queries[0]?.queryKey;
    expect(queryKey).toEqual(['prices', 'prod-001', undefined]);
  });
});
