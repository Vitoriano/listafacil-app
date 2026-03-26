import { act, renderHook } from '@testing-library/react-native';
import { useScanner } from '@/features/scanner/hooks/useScanner';

// Mock expo-camera
const mockRequestPermission = jest.fn();
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
}));

// Mock expo-haptics
const mockImpactAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: unknown[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

// Mock logger
jest.mock('@/shared/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useCameraPermissions } from 'expo-camera';

const mockUseCameraPermissions = useCameraPermissions as jest.Mock;

function setupGranted() {
  mockUseCameraPermissions.mockReturnValue([
    { granted: true, status: 'granted' },
    mockRequestPermission,
  ]);
}

function setupDenied() {
  mockUseCameraPermissions.mockReturnValue([
    { granted: false, status: 'denied' },
    mockRequestPermission,
  ]);
}

function setupNullPermission() {
  mockUseCameraPermissions.mockReturnValue([null, mockRequestPermission]);
}

describe('useScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupGranted();
  });

  describe('permission', () => {
    it('returns permissionGranted=true when camera permission is granted', () => {
      setupGranted();
      const { result } = renderHook(() => useScanner());
      expect(result.current.permissionGranted).toBe(true);
      expect(result.current.permissionStatus).toBe('granted');
    });

    it('returns permissionGranted=false when camera permission is denied', () => {
      setupDenied();
      const { result } = renderHook(() => useScanner());
      expect(result.current.permissionGranted).toBe(false);
      expect(result.current.permissionStatus).toBe('denied');
    });

    it('returns permissionGranted=false and status=undetermined when permission is null', () => {
      setupNullPermission();
      const { result } = renderHook(() => useScanner());
      expect(result.current.permissionGranted).toBe(false);
      expect(result.current.permissionStatus).toBe('undetermined');
    });

    it('calls the native requestPermission function', async () => {
      mockRequestPermission.mockResolvedValue({ granted: true, status: 'granted' });
      const { result } = renderHook(() => useScanner());
      await act(async () => {
        await result.current.requestPermission();
      });
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleBarcodeScanned', () => {
    it('sets scannedBarcode and pauses scanning after detection', () => {
      const { result } = renderHook(() => useScanner());

      expect(result.current.isPaused).toBe(false);
      expect(result.current.scannedBarcode).toBeNull();

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '7891093010014' });
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.scannedBarcode).toBe('7891093010014');
    });

    it('triggers haptic feedback on successful barcode detection', () => {
      const { result } = renderHook(() => useScanner());

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '7891093010014' });
      });

      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
      expect(mockImpactAsync).toHaveBeenCalledWith('Light');
    });

    it('ignores subsequent scans when already paused', () => {
      const { result } = renderHook(() => useScanner());

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '7891093010014' });
      });

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '9999999999999' });
      });

      // Still the first barcode
      expect(result.current.scannedBarcode).toBe('7891093010014');
      expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('resumeScan', () => {
    it('resets paused state and clears scannedBarcode', () => {
      const { result } = renderHook(() => useScanner());

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '7891093010014' });
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumeScan();
      });

      expect(result.current.isPaused).toBe(false);
      expect(result.current.scannedBarcode).toBeNull();
    });

    it('allows a new scan to be detected after resumeScan', () => {
      const { result } = renderHook(() => useScanner());

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '7891093010014' });
      });

      act(() => {
        result.current.resumeScan();
      });

      act(() => {
        result.current.handleBarcodeScanned({ type: 'ean13', data: '9999999999999' });
      });

      expect(result.current.scannedBarcode).toBe('9999999999999');
    });
  });

  describe('setManualBarcode', () => {
    it('sets scannedBarcode and pauses scanning', () => {
      const { result } = renderHook(() => useScanner());

      act(() => {
        result.current.setManualBarcode('1234567890123');
      });

      expect(result.current.scannedBarcode).toBe('1234567890123');
      expect(result.current.isPaused).toBe(true);
    });
  });
});
