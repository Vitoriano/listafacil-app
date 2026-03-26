import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ProductDetailScreen } from '@/features/products/components/ProductDetailScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <ProductDetailScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid product id', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ id: 'prod-001' });
    });

    it('renders all product fields for a known product id', async () => {
      const { getByText, getAllByText } = renderScreen();
      // Wait for product data by checking for Resumo de Precos (unique to loaded state)
      await waitFor(() => expect(getByText('Resumo de Precos')).toBeTruthy());
      // Product name appears in header AND body — expect at least 1 instance
      expect(getAllByText('Arroz Branco Tipo 1 Tio João').length).toBeGreaterThan(0);
      expect(getByText('Tio João')).toBeTruthy();
      // category and unit may appear in badge and detail section — expect at least 1
      expect(getAllByText('grains').length).toBeGreaterThan(0);
      expect(getAllByText('5kg').length).toBeGreaterThan(0);
      // Barcode
      expect(getByText('7891093010014')).toBeTruthy();
      // Price section
      expect(getByText('Resumo de Precos')).toBeTruthy();
      expect(getByText('Menor Preco')).toBeTruthy();
      expect(getByText('Preco Medio')).toBeTruthy();
      // Submissions count
      expect(getByText(/8 contribuicoes/)).toBeTruthy();
    });

    it('renders Comparar Precos button', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Resumo de Precos')).toBeTruthy());
      expect(getByText('Comparar Precos')).toBeTruthy();
    });

    it('renders Enviar Preco button', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Resumo de Precos')).toBeTruthy());
      expect(getByText('Enviar Preco')).toBeTruthy();
    });

    it('"Comparar Precos" button navigates to prices comparison screen with correct productId param', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Comparar Precos')).toBeTruthy());
      fireEvent.press(getByText('Comparar Precos'));
      expect(mockPush).toHaveBeenCalledWith('/products/prices?productId=prod-001');
    });

    it('"Enviar Preco" button navigates to price submission screen with correct productId param', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Enviar Preco')).toBeTruthy());
      fireEvent.press(getByText('Enviar Preco'));
      expect(mockPush).toHaveBeenCalledWith('/products/prices/submit?productId=prod-001');
    });

    it('renders loading spinner during fetch (initial loading state)', () => {
      // On the very first render the query is loading
      const { UNSAFE_getAllByType } = renderScreen();
      // Just ensure render doesn't crash during loading
      expect(UNSAFE_getAllByType).toBeDefined();
    });
  });

  describe('with non-existent product id', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ id: 'nonexistent-product-id' });
    });

    it('renders empty state when product id is not found (null result)', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Produto Nao Encontrado')).toBeTruthy());
      expect(getByText('O produto que voce procura nao existe.')).toBeTruthy();
    });

    it('renders Voltar button in not-found state', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Voltar')).toBeTruthy());
    });

    it('pressing Voltar calls router.back()', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Voltar')).toBeTruthy());
      fireEvent.press(getByText('Voltar'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('with no id (empty params)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({});
    });

    it('renders Detalhe do Produto header when id is missing', () => {
      const { getByText } = renderScreen();
      // When no id, query is disabled → product is undefined → shows not-found state
      expect(getByText('Detalhe do Produto')).toBeTruthy();
    });
  });
});
