import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { SettingsScreen } from '@/features/profile/components/SettingsScreen';
import { useAuthStore } from '@/features/auth/stores/authStore';

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
      <SettingsScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset authStore
    useAuthStore.setState({ user: null, token: null });
  });

  it('logout button is present and accessible', () => {
    const { getByRole } = renderScreen();
    expect(getByRole('button', { name: 'Log Out' })).toBeTruthy();
  });

  it('pressing logout clears authStore and navigates to /auth/login', () => {
    // Set a user in the store before testing
    useAuthStore.setState({
      user: {
        id: 'user-001',
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        avatarUrl: null,
        totalSubmissions: 47,
        totalSavings: 312.8,
        joinedAt: '2025-01-15T10:00:00Z',
      },
      token: 'mock-token-123',
    });

    const { getByRole } = renderScreen();
    fireEvent.press(getByRole('button', { name: 'Log Out' }));

    // Auth store should be cleared
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();

    // Navigation should redirect to auth/login
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('renders Settings title', () => {
    const { getByText } = renderScreen();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('shows account info when user is logged in', () => {
    useAuthStore.setState({
      user: {
        id: 'user-001',
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        avatarUrl: null,
        totalSubmissions: 47,
        totalSavings: 312.8,
        joinedAt: '2025-01-15T10:00:00Z',
      },
      token: 'mock-token-123',
    });

    const { getByText } = renderScreen();
    expect(getByText('Maria Silva')).toBeTruthy();
    expect(getByText('maria.silva@email.com')).toBeTruthy();
  });
});
