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
      expect(getByText('Camera Permission Required')).toBeTruthy();
      expect(getByText('Grant Permission')).toBeTruthy();
      expect(getByText('Enter Barcode Manually')).toBeTruthy();
    });

    it('opens ManualEntryModal from the permission fallback screen', () => {
      const { getByText, getByLabelText } = renderScanner();
      fireEvent.press(getByText('Enter Barcode Manually'));
      expect(getByLabelText('Barcode input')).toBeTruthy();
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
      await waitFor(() => expect(getByText('Enter Barcode Manually')).toBeTruthy());
    });

    it('shows the instruction label while camera is active', async () => {
      const { getByText } = renderScanner();
      await waitFor(() =>
        expect(getByText('Point camera at a barcode to scan')).toBeTruthy(),
      );
    });

    it('opens ManualEntryModal when the manual entry button is pressed', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Enter Barcode Manually')).toBeTruthy());
      fireEvent.press(getByText('Enter Barcode Manually'));
      expect(getByLabelText('Barcode input')).toBeTruthy();
    });

    it('shows product-not-found sheet after manual entry of unknown barcode', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Enter Barcode Manually')).toBeTruthy());

      // Open modal
      fireEvent.press(getByText('Enter Barcode Manually'));
      const input = getByLabelText('Barcode input');
      fireEvent.changeText(input, '0000000000000');
      fireEvent.press(getByText('Search Product'));

      // Wait for query to resolve and not-found sheet to appear
      await waitFor(() => expect(getByText('Product Not Found')).toBeTruthy(), {
        timeout: 3000,
      });
      expect(getByText('Scan Again')).toBeTruthy();
    });

    it('navigates to product detail after manual entry of known barcode', async () => {
      const { getByText, getByLabelText } = renderScanner();
      await waitFor(() => expect(getByText('Enter Barcode Manually')).toBeTruthy());

      // Open modal and submit a known barcode
      fireEvent.press(getByText('Enter Barcode Manually'));
      const input = getByLabelText('Barcode input');
      fireEvent.changeText(input, '7891093010014');
      fireEvent.press(getByText('Search Product'));

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/products/prod-001'), {
        timeout: 3000,
      });
    });

    it('dismisses the not-found sheet and resumes scan on "Scan Again"', async () => {
      const { getByText, getByLabelText, queryByText } = renderScanner();
      await waitFor(() => expect(getByText('Enter Barcode Manually')).toBeTruthy());

      // Trigger not-found state
      fireEvent.press(getByText('Enter Barcode Manually'));
      const input = getByLabelText('Barcode input');
      fireEvent.changeText(input, '0000000000000');
      fireEvent.press(getByText('Search Product'));

      await waitFor(() => expect(getByText('Product Not Found')).toBeTruthy(), {
        timeout: 3000,
      });

      act(() => {
        fireEvent.press(getByText('Scan Again'));
      });

      expect(queryByText('Product Not Found')).toBeNull();
    });
  });
});
