import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePriceHistory } from '@/features/prices/hooks/usePriceHistory';

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

describe('usePriceHistory', () => {
  it('returns PriceHistoryPoint[] sorted chronologically for a known productId', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceHistory('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data!.length).toBeGreaterThan(0);

    const history = result.current.data!;
    for (let i = 1; i < history.length; i++) {
      expect(new Date(history[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(history[i - 1].date).getTime(),
      );
    }
  });

  it('returns empty array for unknown productId', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceHistory('unknown-product-id'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('is disabled when productId is null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceHistory(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('each history point has date, price, storeId, and storeName', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePriceHistory('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const history = result.current.data!;
    history.forEach((point) => {
      expect(point.date).toBeDefined();
      expect(typeof point.price).toBe('number');
      expect(point.storeId).toBeDefined();
      expect(point.storeName).toBeDefined();
    });
  });
});
