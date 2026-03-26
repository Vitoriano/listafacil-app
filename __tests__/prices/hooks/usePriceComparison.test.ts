import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePriceComparison } from '@/features/prices/hooks/usePriceComparison';

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

describe('usePriceComparison', () => {
  it('returns PriceComparison with entries sorted by price ascending for a known productId', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceComparison('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.productId).toBe('prod-001');
    expect(result.current.data?.entries.length).toBeGreaterThan(1);

    const entries = result.current.data!.entries;
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].price).toBeGreaterThanOrEqual(entries[i - 1].price);
    }
  });

  it('returns loading state before data arrives', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceComparison('prod-001'), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('is disabled when productId is null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceComparison(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('returns summary stats (lowestPrice, highestPrice, averagePrice, storeCount)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceComparison('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const data = result.current.data!;
    expect(data.lowestPrice).toBe(19.99);
    expect(data.highestPrice).toBe(23.9);
    // prod-001 has 7 entries across 7 unique stores in seed data
    expect(data.storeCount).toBe(7);
    expect(data.averagePrice).toBeGreaterThan(0);
  });
});
