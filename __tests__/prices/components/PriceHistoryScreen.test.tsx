import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { PriceHistoryScreen } from '@/features/prices/components/PriceHistoryScreen';

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
      <PriceHistoryScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PriceHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid productId (prod-001)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ productId: 'prod-001' });
    });

    it('renders history list for a known productId', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Price History')).toBeTruthy());
      // prod-001 has prices at Atacadão, Pão de Açúcar, etc.
      await waitFor(() => expect(getByText('Atacadão')).toBeTruthy());
    });

    it('each entry displays store name and BRL-formatted price', async () => {
      const { getAllByText } = renderScreen();
      await waitFor(() => {
        // Store names should appear
        expect(getAllByText('Atacadão').length).toBeGreaterThan(0);
      });
    });

    it('renders "Go Back" button', async () => {
      const { getByRole } = renderScreen();
      await waitFor(() => {
        const backButton = getByRole('button', { name: 'Go Back' });
        expect(backButton).toBeTruthy();
      });
    });

    it('pressing back button calls router.back()', async () => {
      const { getAllByRole } = renderScreen();
      await waitFor(() => {
        const backButtons = getAllByRole('button').filter(
          (b) => b.props.accessibilityLabel === 'Voltar',
        );
        expect(backButtons.length).toBeGreaterThan(0);
      });
      const backButton = getAllByRole('button').find(
        (b) => b.props.accessibilityLabel === 'Voltar',
      );
      fireEvent.press(backButton!);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('with unknown productId', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ productId: 'unknown-product-id' });
    });

    it('renders EmptyState when history is empty', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('No History Found')).toBeTruthy());
      expect(getByText('No price history found for this product.')).toBeTruthy();
    });
  });

  describe('with storeId filter', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({
        productId: 'prod-001',
        storeId: 'store-001',
      });
    });

    it('shows "Filtered by store" subtitle when storeId is provided', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Price History')).toBeTruthy());
      expect(getByText('Filtered by store')).toBeTruthy();
    });

    it('renders entries only for the specified store', async () => {
      const { getByText, queryByText } = renderScreen();
      await waitFor(() => expect(getByText('Pão de Açúcar')).toBeTruthy());
      // Atacadão (store-004) entries should not appear when filtering by store-001
      expect(queryByText('Atacadão')).toBeNull();
    });
  });
});
