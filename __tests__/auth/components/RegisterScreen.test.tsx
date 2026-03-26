import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { RegisterScreen } from '@/features/auth/components/RegisterScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({}),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <RegisterScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders name, email, password, confirmPassword inputs and submit button', () => {
    const { getByLabelText, getByRole } = renderScreen();
    expect(getByLabelText('Campo de nome')).toBeTruthy();
    expect(getByLabelText('Campo de email')).toBeTruthy();
    expect(getByLabelText('Campo de senha')).toBeTruthy();
    expect(getByLabelText('Campo de confirmar senha')).toBeTruthy();
    expect(getByRole('button', { name: 'Criar Conta' })).toBeTruthy();
  });

  it('shows validation error when passwords do not match', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Campo de nome'), 'João Silva');
    fireEvent.changeText(getByLabelText('Campo de email'), 'joao@example.com');
    fireEvent.changeText(getByLabelText('Campo de senha'), 'password123');
    fireEvent.changeText(
      getByLabelText('Campo de confirmar senha'),
      'differentpass',
    );
    fireEvent.press(getByRole('button', { name: 'Criar Conta' }));

    await findByText('Passwords do not match');
  });

  it('shows validation error for short name on submit', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Campo de nome'), 'A');
    fireEvent.changeText(getByLabelText('Campo de email'), 'a@example.com');
    fireEvent.changeText(getByLabelText('Campo de senha'), 'password123');
    fireEvent.changeText(
      getByLabelText('Campo de confirmar senha'),
      'password123',
    );
    fireEvent.press(getByRole('button', { name: 'Criar Conta' }));

    await findByText('Name must be at least 2 characters');
  });

  it('successful registration navigates away from auth flow', async () => {
    const { getByLabelText, getByRole } = renderScreen();

    fireEvent.changeText(getByLabelText('Campo de nome'), 'Maria Nova');
    fireEvent.changeText(getByLabelText('Campo de email'), 'maria.nova@example.com');
    fireEvent.changeText(getByLabelText('Campo de senha'), 'securepass123');
    fireEvent.changeText(
      getByLabelText('Campo de confirmar senha'),
      'securepass123',
    );
    fireEvent.press(getByRole('button', { name: 'Criar Conta' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), {
      timeout: 3000,
    });
  });

  it('navigation link to LoginScreen is present', () => {
    const { getByRole } = renderScreen();
    expect(getByRole('button', { name: 'Ir para login' })).toBeTruthy();
  });

  it('tapping login link navigates to /auth/login', () => {
    const { getByRole } = renderScreen();
    fireEvent.press(getByRole('button', { name: 'Ir para login' }));
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});
