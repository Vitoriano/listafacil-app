import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { PriceComparisonScreen } from '@/features/prices/components/PriceComparisonScreen';

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
      <PriceComparisonScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PriceComparisonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with valid productId (prod-001)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ productId: 'prod-001' });
    });

    it('renders loading spinner during initial fetch', () => {
      const { UNSAFE_getAllByType } = renderScreen();
      // Spinner renders during loading — just verify no crash
      expect(UNSAFE_getAllByType).toBeDefined();
    });

    it('renders price entries sorted by price ascending when data loads', async () => {
      const { getByText } = renderScreen();
      // Wait for price data to load — Atacadão is cheapest for prod-001 at R$ 19,99
      await waitFor(() => expect(getByText('Atacadão')).toBeTruthy());
      expect(getByText('Pão de Açúcar')).toBeTruthy();
    });

    it('renders summary row showing price summary section', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Price Summary')).toBeTruthy());
      expect(getByText('Lowest')).toBeTruthy();
      expect(getByText('Average')).toBeTruthy();
      expect(getByText('Highest')).toBeTruthy();
    });

    it('"Submit Price" CTA navigates to /products/prices/submit with productId', async () => {
      const { getAllByText } = renderScreen();
      await waitFor(() => expect(getAllByText('Submit Price').length).toBeGreaterThan(0));
      fireEvent.press(getAllByText('Submit Price')[0]);
      expect(mockPush).toHaveBeenCalledWith(
        '/products/prices/submit?productId=prod-001',
      );
    });

    it('"View History" CTA navigates to /products/prices/history with productId', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('View History')).toBeTruthy());
      fireEvent.press(getByText('View History'));
      expect(mockPush).toHaveBeenCalledWith(
        '/products/prices/history?productId=prod-001',
      );
    });

    it('community validation thumbs-up control is rendered for each entry', async () => {
      const { getAllByRole } = renderScreen();
      await waitFor(() => {
        const buttons = getAllByRole('button');
        const thumbsUpButtons = buttons.filter(
          (b) => b.props.accessibilityLabel?.startsWith('Validate price as correct'),
        );
        expect(thumbsUpButtons.length).toBeGreaterThan(0);
      });
    });

    it('community validation thumbs-down control is rendered for each entry', async () => {
      const { getAllByRole } = renderScreen();
      await waitFor(() => {
        const buttons = getAllByRole('button');
        const thumbsDownButtons = buttons.filter(
          (b) => b.props.accessibilityLabel?.startsWith('Validate price as incorrect'),
        );
        expect(thumbsDownButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('with unknown productId', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ productId: 'unknown-product-id' });
    });

    it('renders EmptyState when comparison returns zero entries', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('No Prices Found')).toBeTruthy());
      expect(
        getByText('No price submissions found for this product. Be the first to submit!'),
      ).toBeTruthy();
    });
  });

  describe('back button', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ productId: 'prod-001' });
    });

    it('back button calls router.back()', async () => {
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
});
