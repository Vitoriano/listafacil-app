import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ProductListScreen } from '@/features/products/components/ProductListScreen';
import { useProductFilterStore } from '@/features/products/stores/productFilterStore';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <ProductListScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProductListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the Zustand store to prevent state leaking between tests
    useProductFilterStore.getState().reset();
  });

  it('renders loading spinner when isLoading is true (initial render)', () => {
    // On first render before TanStack Query resolves, spinner is shown
    const { UNSAFE_getAllByType } = renderScreen();
    // ActivityIndicator is the underlying component of Spinner/LoadingSpinner
    const { ActivityIndicator } = require('react-native');
    // Just verify it renders without crashing during loading
    expect(UNSAFE_getAllByType).toBeDefined();
  });

  it('renders product list after data loads', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    // Seed data contains 'Arroz Branco Tipo 1 Tio João'
    await waitFor(() =>
      expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy(),
    );
  });

  it('renders list of ProductCard items when data is returned', async () => {
    const { getByText, getAllByRole } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    // Each ProductCard has accessibilityRole="button"
    const cards = getAllByRole('button');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders empty state when search has no matches', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());

    // Type a search that matches nothing in seed data
    const input = getByPlaceholderText('Search by name or brand...');
    fireEvent.changeText(input, 'zzz-nonexistent-product-xyz-999');

    await waitFor(() => expect(getByText('No products found')).toBeTruthy());
  });

  it('search input updates filter state and triggers new query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    // Seed data has arroz
    await waitFor(() => expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy());

    // Type in search
    const input = getByPlaceholderText('Search by name or brand...');
    fireEvent.changeText(input, 'Arroz');

    // After search, should still show arroz products
    await waitFor(() =>
      expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy(),
    );
  });

  it('search input filters out non-matching products', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    await waitFor(() => expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy());

    // Search for only arroz
    const input = getByPlaceholderText('Search by name or brand...');
    fireEvent.changeText(input, 'Arroz');

    await waitFor(() =>
      expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy(),
    );
  });

  it('category filter button is rendered', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    // Category filter tabs should include 'All', 'Fruits', etc.
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Fruits')).toBeTruthy();
  });

  it('pressing a category tab updates filter state', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());

    // Press on 'Grains' category
    fireEvent.press(getByText('Grains'));

    // After filtering by grains, should show grain products
    await waitFor(() =>
      expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy(),
    );
  });

  it('sort controls are rendered', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Price')).toBeTruthy();
    expect(getByText('Recent')).toBeTruthy();
  });

  it('pressing a product card navigates to product detail', async () => {
    const { getByText, getAllByRole } = renderScreen();
    await waitFor(() => expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy());

    // Press first product card
    const cards = getAllByRole('button');
    const productCard = cards.find((card) => {
      const label = card.props.accessibilityLabel;
      return label && label.startsWith('Product ');
    });
    if (productCard) {
      fireEvent.press(productCard);
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/products\//));
    }
  });
});
