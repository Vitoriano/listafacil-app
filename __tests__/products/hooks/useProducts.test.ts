import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '@/features/products/hooks/useProducts';

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

describe('useProducts', () => {
  it('returns paginated product list from repository', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProducts({}), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toBeDefined();
    expect(Array.isArray(result.current.data?.data)).toBe(true);
    expect(result.current.data!.data.length).toBeGreaterThan(0);
  });

  it('passes search query param to repository when provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProducts({ q: 'Arroz' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.every((p) => p.name.toLowerCase().includes('arroz') || p.brand.toLowerCase().includes('arroz'))).toBe(true);
  });

  it('passes categoryId filter param to repository when provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProducts({ categoryId: 10 }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.categoryId === 10)).toBe(true);
  });

  it('returns loading state before data arrives', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProducts({}), { wrapper });
    // On initial render before the async query resolves
    expect(result.current.isLoading).toBe(true);
  });

  it('uses query key [products, params]', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: 0 } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);

    const params = { q: 'test', categoryId: 10 };
    const { result } = renderHook(() => useProducts(params), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const queries = client.getQueryCache().findAll();
    const queryKey = queries[0]?.queryKey;
    expect(queryKey).toEqual(['products', params]);
  });
});
