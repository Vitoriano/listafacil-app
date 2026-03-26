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
    expect(getByLabelText('Name input')).toBeTruthy();
    expect(getByLabelText('Email input')).toBeTruthy();
    expect(getByLabelText('Password input')).toBeTruthy();
    expect(getByLabelText('Confirm Password input')).toBeTruthy();
    expect(getByRole('button', { name: 'Create Account' })).toBeTruthy();
  });

  it('shows validation error when passwords do not match', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Name input'), 'João Silva');
    fireEvent.changeText(getByLabelText('Email input'), 'joao@example.com');
    fireEvent.changeText(getByLabelText('Password input'), 'password123');
    fireEvent.changeText(
      getByLabelText('Confirm Password input'),
      'differentpass',
    );
    fireEvent.press(getByRole('button', { name: 'Create Account' }));

    await findByText('Passwords do not match');
  });

  it('shows validation error for short name on submit', async () => {
    const { getByLabelText, getByRole, findByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Name input'), 'A');
    fireEvent.changeText(getByLabelText('Email input'), 'a@example.com');
    fireEvent.changeText(getByLabelText('Password input'), 'password123');
    fireEvent.changeText(
      getByLabelText('Confirm Password input'),
      'password123',
    );
    fireEvent.press(getByRole('button', { name: 'Create Account' }));

    await findByText('Name must be at least 2 characters');
  });

  it('successful registration navigates away from auth flow', async () => {
    const { getByLabelText, getByRole } = renderScreen();

    fireEvent.changeText(getByLabelText('Name input'), 'Maria Nova');
    fireEvent.changeText(getByLabelText('Email input'), 'maria.nova@example.com');
    fireEvent.changeText(getByLabelText('Password input'), 'securepass123');
    fireEvent.changeText(
      getByLabelText('Confirm Password input'),
      'securepass123',
    );
    fireEvent.press(getByRole('button', { name: 'Create Account' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), {
      timeout: 3000,
    });
  });

  it('navigation link to LoginScreen is present', () => {
    const { getByRole } = renderScreen();
    expect(getByRole('button', { name: 'Go to Login' })).toBeTruthy();
  });

  it('tapping login link navigates to /auth/login', () => {
    const { getByRole } = renderScreen();
    fireEvent.press(getByRole('button', { name: 'Go to Login' }));
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});
