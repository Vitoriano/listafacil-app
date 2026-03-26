import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { LoginScreen } from '@/features/auth/components/LoginScreen';

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
      <LoginScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input, password input, and submit button', () => {
    const { getByLabelText, getByRole } = renderScreen();
    expect(getByLabelText('Email input')).toBeTruthy();
    expect(getByLabelText('Password input')).toBeTruthy();
    expect(getByRole('button', { name: 'Sign In' })).toBeTruthy();
  });

  it('shows validation error for invalid email on submit attempt', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email input'), 'not-an-email');
    fireEvent.changeText(getByLabelText('Password input'), 'password123');
    fireEvent.press(getByRole('button', { name: 'Sign In' }));

    await findByText('Invalid email');
  });

  it('shows validation error for short password on submit attempt', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email input'), 'user@example.com');
    fireEvent.changeText(getByLabelText('Password input'), 'abc');
    fireEvent.press(getByRole('button', { name: 'Sign In' }));

    await findByText('Password must be at least 6 characters');
  });

  it('successful login navigates away from auth flow (router.replace called with tabs route)', async () => {
    const { getByLabelText, getByRole } = renderScreen();

    fireEvent.changeText(
      getByLabelText('Email input'),
      'maria.silva@email.com',
    );
    fireEvent.changeText(getByLabelText('Password input'), 'password123');
    fireEvent.press(getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), {
      timeout: 3000,
    });
  });

  it('navigation link to RegisterScreen is present', () => {
    const { getByRole } = renderScreen();
    expect(getByRole('button', { name: 'Go to Register' })).toBeTruthy();
  });

  it('tapping register link navigates to /auth/register', () => {
    const { getByRole } = renderScreen();
    fireEvent.press(getByRole('button', { name: 'Go to Register' }));
    expect(mockPush).toHaveBeenCalledWith('/auth/register');
  });
});
