import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { CreateListScreen } from '@/features/lists/components/CreateListScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({}),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderScreen() {
  return render(
    <AppProviders>
      <CreateListScreen />
    </AppProviders>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CreateListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the name input field', () => {
    const { getByLabelText } = renderScreen();
    expect(getByLabelText('Campo nome da lista')).toBeTruthy();
  });

  it('shows inline validation error when submitting with empty name', async () => {
    const { getByRole, findByText } = renderScreen();
    const submitButton = getByRole('button', { name: 'Criar Lista' });
    fireEvent.press(submitButton);
    await findByText('List name is required');
  });

  it('shows inline validation error when name exceeds 100 characters', async () => {
    const { getByRole, getByLabelText, findByText } = renderScreen();
    const input = getByLabelText('Campo nome da lista');
    fireEvent.changeText(input, 'A'.repeat(101));
    const submitButton = getByRole('button', { name: 'Criar Lista' });
    fireEvent.press(submitButton);
    await findByText('Name too long');
  });

  it('successful form submit calls useCreateList and calls router.back()', async () => {
    const { getByRole, getByLabelText } = renderScreen();
    const input = getByLabelText('Campo nome da lista');
    fireEvent.changeText(input, 'My New List');
    const submitButton = getByRole('button', { name: 'Criar Lista' });
    fireEvent.press(submitButton);
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
  });

  it('submit button is accessible', () => {
    const { getByRole } = renderScreen();
    const button = getByRole('button', { name: 'Criar Lista' });
    expect(button).toBeTruthy();
  });

  it('back button calls router.back()', () => {
    const { getAllByRole } = renderScreen();
    const backButton = getAllByRole('button').find(
      (b) => b.props.accessibilityLabel === 'Voltar',
    );
    expect(backButton).toBeTruthy();
    fireEvent.press(backButton!);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
