import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';

// Disable mock delays so TanStack Query resolves synchronously in tests
jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

// Mock expo-camera for ScannerScreen (permission denied so it renders the fallback UI)
jest.mock('expo-camera', () => ({
  CameraView: ({ children }: { children?: React.ReactNode }) =>
    require('react-native').createElement('View', { testID: 'camera-view' }, children),
  useCameraPermissions: jest.fn(() => [
    { granted: false, status: 'denied' },
    jest.fn().mockResolvedValue({ granted: false, status: 'denied' }),
  ]),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light' },
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

import { ScannerScreen } from '@/features/scanner/components/ScannerScreen';
import { ProductListScreen } from '@/features/products/components/ProductListScreen';
import { ProductDetailScreen } from '@/features/products/components/ProductDetailScreen';
import { PriceComparisonScreen } from '@/features/prices/components/PriceComparisonScreen';
import { PriceSubmitScreen } from '@/features/prices/components/PriceSubmitScreen';
import { PriceHistoryScreen } from '@/features/prices/components/PriceHistoryScreen';
import { ShoppingListsScreen } from '@/features/lists/components/ShoppingListsScreen';
import { ListDetailScreen } from '@/features/lists/components/ListDetailScreen';
import { CreateListScreen } from '@/features/lists/components/CreateListScreen';
import { OptimizeScreen } from '@/features/lists/components/OptimizeScreen';
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';
import { SavingsScreen } from '@/features/profile/components/SavingsScreen';
import { SettingsScreen } from '@/features/profile/components/SettingsScreen';
import { LoginScreen } from '@/features/auth/components/LoginScreen';
import { RegisterScreen } from '@/features/auth/components/RegisterScreen';

function renderWithProviders(ui: React.ReactElement) {
  return render(<AppProviders>{ui}</AppProviders>);
}

describe('Navigation placeholder screens', () => {
  it('ScannerScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<ScannerScreen />);
    // ScannerScreen shows the permission fallback when camera permission is denied
    expect(getByText('Camera Permission Required')).toBeTruthy();
  });

  it('ProductListScreen renders without crashing', async () => {
    const { getByText } = renderWithProviders(<ProductListScreen />);
    await waitFor(() => expect(getByText('Products')).toBeTruthy());
  });

  it('ProductDetailScreen renders without crashing (no id → shows not found)', () => {
    const { getByText } = renderWithProviders(<ProductDetailScreen />);
    // No id provided via useLocalSearchParams → shows "Product Detail" header + not found state
    expect(getByText('Product Detail')).toBeTruthy();
  });

  it('PriceComparisonScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<PriceComparisonScreen />);
    expect(getByText('Price Comparison')).toBeTruthy();
  });

  it('PriceSubmitScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<PriceSubmitScreen />);
    expect(getByText('Submit Price')).toBeTruthy();
  });

  it('PriceHistoryScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<PriceHistoryScreen />);
    expect(getByText('Price History')).toBeTruthy();
  });

  it('ShoppingListsScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<ShoppingListsScreen />);
    expect(getByText('Shopping Lists')).toBeTruthy();
  });

  it('ListDetailScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<ListDetailScreen />);
    expect(getByText('List Detail')).toBeTruthy();
  });

  it('CreateListScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<CreateListScreen />);
    expect(getByText('Create List')).toBeTruthy();
  });

  it('OptimizeScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<OptimizeScreen />);
    expect(getByText('Optimize')).toBeTruthy();
  });

  it('ProfileScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);
    expect(getByText('Profile')).toBeTruthy();
  });

  it('SavingsScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<SavingsScreen />);
    expect(getByText('Savings')).toBeTruthy();
  });

  it('SettingsScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('LoginScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    expect(getByText('Login')).toBeTruthy();
  });

  it('RegisterScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<RegisterScreen />);
    expect(getByText('Register')).toBeTruthy();
  });
});
