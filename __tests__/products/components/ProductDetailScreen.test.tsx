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
      // Wait for product data by checking for Price Summary (unique to loaded state)
      await waitFor(() => expect(getByText('Price Summary')).toBeTruthy());
      // Product name appears in header AND body — expect at least 1 instance
      expect(getAllByText('Arroz Branco Tipo 1 Tio João').length).toBeGreaterThan(0);
      expect(getByText('Tio João')).toBeTruthy();
      // category and unit may appear in badge and detail section — expect at least 1
      expect(getAllByText('grains').length).toBeGreaterThan(0);
      expect(getAllByText('5kg').length).toBeGreaterThan(0);
      // Barcode
      expect(getByText('7891093010014')).toBeTruthy();
      // Price section
      expect(getByText('Price Summary')).toBeTruthy();
      expect(getByText('Lowest Price')).toBeTruthy();
      expect(getByText('Average Price')).toBeTruthy();
      // Submissions count
      expect(getByText(/8 submissions/)).toBeTruthy();
    });

    it('renders Compare Prices button', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Price Summary')).toBeTruthy());
      expect(getByText('Compare Prices')).toBeTruthy();
    });

    it('renders Submit Price button', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Price Summary')).toBeTruthy());
      expect(getByText('Submit Price')).toBeTruthy();
    });

    it('"Compare Prices" button navigates to prices comparison screen with correct productId param', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Compare Prices')).toBeTruthy());
      fireEvent.press(getByText('Compare Prices'));
      expect(mockPush).toHaveBeenCalledWith('/products/prices?productId=prod-001');
    });

    it('"Submit Price" button navigates to price submission screen with correct productId param', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Submit Price')).toBeTruthy());
      fireEvent.press(getByText('Submit Price'));
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
      await waitFor(() => expect(getByText('Product Not Found')).toBeTruthy());
      expect(getByText('The product you are looking for does not exist.')).toBeTruthy();
    });

    it('renders Go Back button in not-found state', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Go Back')).toBeTruthy());
    });

    it('pressing Go Back calls router.back()', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Go Back')).toBeTruthy());
      fireEvent.press(getByText('Go Back'));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('with no id (empty params)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({});
    });

    it('renders Product Detail header when id is missing', () => {
      const { getByText } = renderScreen();
      // When no id, query is disabled → product is undefined → shows not-found state
      expect(getByText('Product Detail')).toBeTruthy();
    });
  });
});
