import { useState, useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { logger } from '@/shared/utils/logger';
import type { BarcodeResult } from '../types';

export interface UseScannerReturn {
  permissionGranted: boolean;
  permissionStatus: string;
  requestPermission: () => Promise<void>;
  isPaused: boolean;
  scannedBarcode: string | null;
  handleBarcodeScanned: (result: BarcodeResult) => void;
  resumeScan: () => void;
  setManualBarcode: (barcode: string) => void;
}

export function useScanner(): UseScannerReturn {
  const [permission, requestPermissionFn] = useCameraPermissions();
  const [isPaused, setIsPaused] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const permissionGranted = permission?.granted ?? false;

  const requestPermission = useCallback(async () => {
    logger.info('Scanner', 'Requesting camera permission');
    await requestPermissionFn();
  }, [requestPermissionFn]);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeResult) => {
      if (isPaused) return;
      logger.info('Scanner', 'Barcode detected', result.data);
      setIsPaused(true);
      setScannedBarcode(result.data);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Haptics not available on all devices — silent failure is acceptable
      });
    },
    [isPaused],
  );

  const resumeScan = useCallback(() => {
    logger.info('Scanner', 'Resuming scan');
    setScannedBarcode(null);
    setIsPaused(false);
  }, []);

  const setManualBarcode = useCallback((barcode: string) => {
    logger.info('Scanner', 'Manual barcode entry', barcode);
    setIsPaused(true);
    setScannedBarcode(barcode);
  }, []);

  return {
    permissionGranted,
    permissionStatus: permission?.status ?? 'undetermined',
    requestPermission,
    isPaused,
    scannedBarcode,
    handleBarcodeScanned,
    resumeScan,
    setManualBarcode,
  };
}
