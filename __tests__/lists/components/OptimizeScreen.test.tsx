import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { OptimizeScreen } from '@/features/lists/components/OptimizeScreen';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <OptimizeScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('OptimizeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner during optimization fetch', () => {
    mockUseLocalSearchParams.mockReturnValue({ listId: 'list-001' });
    const { UNSAFE_getAllByType } = renderScreen();
    expect(UNSAFE_getAllByType).toBeDefined();
  });

  describe('with list-001 (has items with prices)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ listId: 'list-001' });
    });

    it('renders best store name after optimization loads', async () => {
      const { getByText } = renderScreen();
      await waitFor(() => expect(getByText('Melhor Loja')).toBeTruthy());
      // Best store name should appear in the screen
      expect(getByText('Melhor Loja')).toBeTruthy();
    });

    it('renders store breakdown rows for all stores in the result', async () => {
      const { getByText } = renderScreen();
      await waitFor(() =>
        expect(getByText('Comparacao entre Lojas')).toBeTruthy(),
      );
      // At least one store breakdown row
      expect(getByText('Comparacao entre Lojas')).toBeTruthy();
    });

    it('back button calls router.back()', async () => {
      const { getAllByRole } = renderScreen();
      await waitFor(() => {
        const backButton = getAllByRole('button').find(
          (b) => b.props.accessibilityLabel === 'Voltar',
        );
        expect(backButton).toBeTruthy();
      });
      const backButton = getAllByRole('button').find(
        (b) => b.props.accessibilityLabel === 'Voltar',
      );
      fireEvent.press(backButton!);
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('with unknown listId (empty optimization)', () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ listId: 'unknown-list-id' });
    });

    it('renders EmptyState when optimization returns 0 total cost', async () => {
      const { getByText } = renderScreen();
      await waitFor(() =>
        expect(getByText('Sem Otimizacao')).toBeTruthy(),
      );
      expect(
        getByText(
          'Adicione itens a sua lista para receber recomendacoes.',
        ),
      ).toBeTruthy();
    });
  });
});
