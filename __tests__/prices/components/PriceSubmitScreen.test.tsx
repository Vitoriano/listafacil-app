import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { PriceSubmitScreen } from '@/features/prices/components/PriceSubmitScreen';

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
      <PriceSubmitScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PriceSubmitScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ productId: 'prod-001' });
  });

  it('renders store selector and price input fields after stores load', async () => {
    const { getByText, getByLabelText } = renderScreen();
    await waitFor(() => expect(getByText('Selecionar Loja')).toBeTruthy());
    expect(getByText('Preco (R$)')).toBeTruthy();
    expect(getByLabelText('Campo de preco')).toBeTruthy();
  });

  it('renders store options from repository', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => expect(getByText('Pão de Açúcar')).toBeTruthy());
    expect(getByText('Atacadão')).toBeTruthy();
    expect(getByText('Carrefour')).toBeTruthy();
  });

  it('Submit button is present and accessible', async () => {
    const { getByRole } = renderScreen();
    await waitFor(() => {
      const submitButton = getByRole('button', { name: 'Enviar Preco' });
      expect(submitButton).toBeTruthy();
    });
  });

  it('shows validation error for missing store when submitting without selecting', async () => {
    const { getByRole, getByLabelText, getByText, findByText } = renderScreen();
    await waitFor(() => expect(getByText('Selecionar Loja')).toBeTruthy());

    // Fill price but no store
    const priceInput = getByLabelText('Campo de preco');
    fireEvent.changeText(priceInput, '19.99');

    const submitButton = getByRole('button', { name: 'Enviar Preco' });
    fireEvent.press(submitButton);

    await findByText('Store is required');
  });

  it('shows validation error when price is empty on submit', async () => {
    const { getByRole, getByText, findByText } = renderScreen();
    await waitFor(() => expect(getByText('Selecionar Loja')).toBeTruthy());

    // Select a store
    const storeButton = getByRole('button', { name: 'Selecionar Pão de Açúcar' });
    fireEvent.press(storeButton);

    // Submit without price (price is undefined → Zod required error)
    const submitButton = getByRole('button', { name: 'Enviar Preco' });
    fireEvent.press(submitButton);

    // Zod v3 maps undefined number to "Required"
    await findByText('Required');
  });

  it('shows validation error when price is zero', async () => {
    const { getByRole, getByText, getByLabelText, findByText } = renderScreen();
    await waitFor(() => expect(getByText('Selecionar Loja')).toBeTruthy());

    // Select a store
    fireEvent.press(getByRole('button', { name: 'Selecionar Pão de Açúcar' }));

    // Enter zero price
    fireEvent.changeText(getByLabelText('Campo de preco'), '0');

    // Submit
    fireEvent.press(getByRole('button', { name: 'Enviar Preco' }));

    await findByText('Price must be positive');
  });

  it('successful form submission navigates back after mutation completes', async () => {
    const { getByRole, getByText, getByLabelText } = renderScreen();
    await waitFor(() => expect(getByText('Selecionar Loja')).toBeTruthy());

    // Select a store
    fireEvent.press(getByRole('button', { name: 'Selecionar Atacadão' }));

    // Enter a valid price
    fireEvent.changeText(getByLabelText('Campo de preco'), '19.99');

    // Submit
    fireEvent.press(getByRole('button', { name: 'Enviar Preco' }));

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });
});
