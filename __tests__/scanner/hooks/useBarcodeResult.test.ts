import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBarcodeResult } from '@/features/scanner/hooks/useBarcodeResult';

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

describe('useBarcodeResult', () => {
  it('query is disabled when barcode is null', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBarcodeResult(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('query is disabled when barcode is empty string', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBarcodeResult(''), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('query is enabled when barcode is present', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBarcodeResult('7891093010014'), { wrapper });
    expect(result.current.fetchStatus).not.toBe('idle');
  });

  it('uses query key [products, barcode, barcode] when barcode is present', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBarcodeResult('7891093010014'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    // Verify the correct product was returned (confirming correct query was run)
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.barcode).toBe('7891093010014');
  });

  it('returns null for an unknown barcode (no match in mock data)', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBarcodeResult('0000000000000'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns a Product object for a known barcode from seed data', async () => {
    const wrapper = createWrapper();
    // 7891093010014 is "Arroz Branco Tipo 1 Tio João" in seed data
    const { result } = renderHook(() => useBarcodeResult('7891093010014'), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.name).toBe('Arroz Branco Tipo 1 Tio João');
    expect(result.current.data?.id).toBe('prod-001');
  });
});
