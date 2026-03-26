import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { queryClient } from '@/config/queryClient';
import { ScannerScreen } from '@/features/scanner/components/ScannerScreen';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

jest.mock('@/config/mock', () => ({
  mockConfig: { enableDelays: false, minDelay: 0, maxDelay: 0 },
}));

const mockRequestPermission = jest.fn().mockResolvedValue({ granted: true, status: 'granted' });

// useCameraPermissions mock — overridden per describe block
const mockUseCameraPermissions = jest.fn();
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, { testID: 'camera-view' }, children),
    useCameraPermissions: (...args: unknown[]) => mockUseCameraPermissions(...args),
  };
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function setupPermissionDenied() {
  mockUseCameraPermissions.mockReturnValue([
    { granted: false, status: 'denied' },
    mockRequestPermission,
  ]);
}

function setupPermissionGranted() {
  mockUseCameraPermissions.mockReturnValue([
    { granted: true, status: 'granted' },
    mockRequestPermission,
  ]);
}

function renderScanner() {
  return render(
    <AppProviders>
      <ScannerScreen />
    </AppProviders>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ScannerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('permission denied', () => {
    beforeEach(() => setupPermissionDenied());

    it('renders camera permission fallback when permission is denied', () => {
      const { getByText } = renderScanner();
      expect(getByText('Permissao de Camera')).toBeTruthy();
      expect(getByText('Permitir Acesso')).toBeTruthy();
      expect(getByText('Digitar Codigo de Barras')).toBeTruthy();
    });

    it('opens ManualEntryModal from the permission fallback screen', () => {
      const { getByText, getByLabelText } = renderScanner();
      fireEvent.press(getByText('Digitar Codigo de Barras'));
      expect(getByLabelText('Campo de codigo de barras')).toBeTruthy();
    });
  });

  describe('permission granted — camera active', () => {
    beforeEach(() => setupPermissionGranted());

    it('renders the camera view when permission is granted', async () => {
      const { getByTestId } = renderScanner();
      await waitFor(() => expect(getByTestId('camera-view')).toBeTruthy());
    });

    it('shows the manual entry button while camera is active', async () => {
      const { getByText } = renderScanner();
      await waitFor(() => expect(getByText('Digitar Codigo')).toBeTruthy());
    });

    it('shows the instruction label while camera is active', async () => {
      const { getByText } = renderScanner();
      await waitFor(() =>
        expect(getByText('Aponte a camera para o codigo de barras')).toBeTruthy(),
      );
    });

    it('opens ManualEntryModal when the manual entry button is pressed', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Digitar Codigo')).toBeTruthy());
      fireEvent.press(getByText('Digitar Codigo'));
      expect(getByLabelText('Campo de codigo de barras')).toBeTruthy();
    });

    it('shows product-not-found sheet after manual entry of unknown barcode', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Digitar Codigo')).toBeTruthy());

      // Open modal
      fireEvent.press(getByText('Digitar Codigo'));
      const input = getByLabelText('Campo de codigo de barras');
      fireEvent.changeText(input, '0000000000000');
      fireEvent.press(getByText('Buscar Produto'));

      // Wait for query to resolve and not-found sheet to appear
      await waitFor(() => expect(getByText('Produto Nao Encontrado')).toBeTruthy(), {
        timeout: 3000,
      });
      expect(getByText('Escanear Novamente')).toBeTruthy();
    });

    it('navigates to product detail after manual entry of known barcode', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Digitar Codigo')).toBeTruthy());

      // Open modal and submit a known barcode
      fireEvent.press(getByText('Digitar Codigo'));
      const input = getByLabelText('Campo de codigo de barras');
      fireEvent.changeText(input, '7891093010014');
      fireEvent.press(getByText('Buscar Produto'));

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/products/prod-001'), {
        timeout: 3000,
      });
    });

    it('dismisses the not-found sheet and resumes scan on "Scan Again"', async () => {
      const { getByText, getByLabelText, queryByText } = renderScanner();
      await waitFor(() => expect(getByText('Digitar Codigo')).toBeTruthy());

      // Trigger not-found state
      fireEvent.press(getByText('Digitar Codigo'));
      const input = getByLabelText('Campo de codigo de barras');
      fireEvent.changeText(input, '0000000000000');
      fireEvent.press(getByText('Buscar Produto'));

      await waitFor(() => expect(getByText('Produto Nao Encontrado')).toBeTruthy(), {
        timeout: 3000,
      });

      act(() => {
        fireEvent.press(getByText('Escanear Novamente'));
      });

      expect(queryByText('Produto Nao Encontrado')).toBeNull();
    });
  });
});
