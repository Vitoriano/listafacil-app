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
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
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
    expect(getByText('Permissao de Camera')).toBeTruthy();
  });

  it('ProductListScreen renders without crashing', async () => {
    const { getByText } = renderWithProviders(<ProductListScreen />);
    await waitFor(() => expect(getByText('Produtos')).toBeTruthy());
  });

  it('ProductDetailScreen renders without crashing (no id → shows not found)', () => {
    const { getByText } = renderWithProviders(<ProductDetailScreen />);
    // No id provided via useLocalSearchParams → shows "Product Detail" header + not found state
    expect(getByText('Detalhe do Produto')).toBeTruthy();
  });

  it('PriceComparisonScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<PriceComparisonScreen />);
    expect(getByText('Comparar Precos')).toBeTruthy();
  });

  it('PriceSubmitScreen renders without crashing', async () => {
    const { getAllByText } = renderWithProviders(<PriceSubmitScreen />);
    // PriceSubmitScreen loads stores first, then shows the form with 'Submit Price' button
    await waitFor(() => expect(getAllByText('Enviar Preco').length).toBeGreaterThan(0));
  });

  it('PriceHistoryScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<PriceHistoryScreen />);
    expect(getByText('Historico de Precos')).toBeTruthy();
  });

  it('ShoppingListsScreen renders without crashing', async () => {
    const { getByText } = renderWithProviders(<ShoppingListsScreen />);
    // ShoppingListsScreen shows header after TanStack Query resolves
    await waitFor(() => expect(getByText('Minhas Listas')).toBeTruthy());
  });

  it('ListDetailScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<ListDetailScreen />);
    expect(getByText('Detalhe da Lista')).toBeTruthy();
  });

  it('CreateListScreen renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<CreateListScreen />);
    // "Create List" appears in both header and submit button
    expect(getAllByText('Criar Lista').length).toBeGreaterThan(0);
  });

  it('OptimizeScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<OptimizeScreen />);
    // OptimizeScreen shows "Store Optimization" as the screen title
    expect(getByText('Otimizacao')).toBeTruthy();
  });

  it('ProfileScreen renders without crashing', async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />);
    // ProfileScreen renders user data after TanStack Query resolves
    await waitFor(() => expect(getByText('Maria Silva')).toBeTruthy(), {
      timeout: 8000,
    });
  }, 10000);

  it('SavingsScreen renders without crashing', async () => {
    const { getByText } = renderWithProviders(<SavingsScreen />);
    // SavingsScreen renders AppHeader with title after data loads
    await waitFor(() => expect(getByText('Economia')).toBeTruthy(), {
      timeout: 8000,
    });
  }, 10000);

  it('SettingsScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);
    expect(getByText('Configuracoes')).toBeTruthy();
  });

  it('LoginScreen renders without crashing', () => {
    const { getByText } = renderWithProviders(<LoginScreen />);
    // LoginScreen shows "Lista Fácil" title and "Sign in to your account" subtitle
    expect(getByText('Lista Facil')).toBeTruthy();
  });

  it('RegisterScreen renders without crashing', () => {
    const { getAllByText } = renderWithProviders(<RegisterScreen />);
    // RegisterScreen shows "Create Account" in both title and button
    expect(getAllByText('Criar Conta').length).toBeGreaterThan(0);
  });
});
