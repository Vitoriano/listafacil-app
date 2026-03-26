import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => ({}),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <ProfileScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user name and email after data loads', async () => {
    const { getByText } = renderScreen();

    // Seed user is "Maria Silva" with email "maria.silva@email.com"
    await waitFor(() => expect(getByText('Maria Silva')).toBeTruthy(), {
      timeout: 8000,
    });
    expect(getByText('maria.silva@email.com')).toBeTruthy();
  }, 10000);

  it('renders totalSubmissions count', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => expect(getByText('Maria Silva')).toBeTruthy(), {
      timeout: 8000,
    });
    // Maria Silva has 47 totalSubmissions from seed data
    expect(getByText('47')).toBeTruthy();
  }, 10000);

  it('renders totalSavings formatted as BRL currency', async () => {
    const { getByText } = renderScreen();

    await waitFor(() => expect(getByText('Maria Silva')).toBeTruthy(), {
      timeout: 8000,
    });
    // Maria Silva has 312.8 totalSavings → formatted as R$ 312,80
    expect(getByText(/R\$\s*312/)).toBeTruthy();
  }, 10000);

  it('renders navigation link to SavingsScreen', async () => {
    const { getByRole } = renderScreen();

    await waitFor(
      () => expect(getByRole('button', { name: 'Ver Economia' })).toBeTruthy(),
      { timeout: 8000 },
    );
  }, 10000);

  it('renders navigation link to Settings', async () => {
    const { getByRole } = renderScreen();

    await waitFor(
      () =>
        expect(getByRole('button', { name: 'Configuracoes' })).toBeTruthy(),
      { timeout: 8000 },
    );
  }, 10000);

  it('tapping Savings navigates to savings screen', async () => {
    const { getByRole } = renderScreen();

    await waitFor(
      () => expect(getByRole('button', { name: 'Ver Economia' })).toBeTruthy(),
      { timeout: 8000 },
    );
    fireEvent.press(getByRole('button', { name: 'Ver Economia' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile/savings');
  }, 10000);
});
