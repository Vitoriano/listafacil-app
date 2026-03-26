import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductDetail } from '@/features/products/hooks/useProductDetail';

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

describe('useProductDetail', () => {
  it('returns product when valid id provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductDetail('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.id).toBe('prod-001');
    expect(result.current.data?.name).toBe('Arroz Branco Tipo 1 Tio João');
  });

  it('returns null when product id does not exist in seed data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductDetail('nonexistent-id'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('query is disabled when id is null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductDetail(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('query is disabled when id is empty string', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProductDetail(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('uses query key [products, id]', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: 0 } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);

    const { result } = renderHook(() => useProductDetail('prod-001'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const queries = client.getQueryCache().findAll();
    const queryKey = queries[0]?.queryKey;
    expect(queryKey).toEqual(['products', 'prod-001']);
  });
});
