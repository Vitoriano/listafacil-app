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
      () => useProducts({ search: 'Arroz' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.every((p) => p.name.toLowerCase().includes('arroz') || p.brand.toLowerCase().includes('arroz'))).toBe(true);
  });

  it('passes category filter param to repository when provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProducts({ category: 'grains' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.category === 'grains')).toBe(true);
  });

  it('passes sortBy param to repository when provided — name sort', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProducts({ sortBy: 'name' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.length).toBeGreaterThan(1);
    for (let i = 1; i < products.length; i++) {
      expect(products[i - 1].name.localeCompare(products[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it('passes sortBy param to repository when provided — price sort', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useProducts({ sortBy: 'price' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const products = result.current.data!.data;
    expect(products.length).toBeGreaterThan(1);
    for (let i = 1; i < products.length; i++) {
      expect(products[i - 1].lowestPrice).toBeLessThanOrEqual(products[i].lowestPrice);
    }
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

    const params = { search: 'test', category: 'grains' as const };
    const { result } = renderHook(() => useProducts(params), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));

    const queries = client.getQueryCache().findAll();
    const queryKey = queries[0]?.queryKey;
    expect(queryKey).toEqual(['products', params]);
  });
});
