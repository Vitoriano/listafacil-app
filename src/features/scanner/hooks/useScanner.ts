import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { logger } from '@/shared/utils/logger';
import type { BarcodeResult } from '../types';

export interface UseScannerReturn {
  permissionGranted: boolean;
  permissionDetermined: boolean;
  permissionStatus: string;
  canAskAgain: boolean;
  requestPermission: () => Promise<void>;
  openSettings: () => void;
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
  const permissionDetermined = permission !== null;
  const canAskAgain = permission?.canAskAgain ?? true;

  const requestPermission = useCallback(async () => {
    logger.info('Scanner', 'Requesting camera permission');
    const result = await requestPermissionFn();
    logger.info('Scanner', 'Permission result', result?.status);
  }, [requestPermissionFn]);

  const openSettings = useCallback(() => {
    logger.info('Scanner', 'Opening app settings');
    Linking.openSettings();
  }, []);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeResult) => {
      if (isPaused) return;
      logger.info('Scanner', 'Barcode detected', result.data);
      setIsPaused(true);
      setScannedBarcode(result.data);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
    permissionDetermined,
    permissionStatus: permission?.status ?? 'undetermined',
    canAskAgain,
    requestPermission,
    openSettings,
    isPaused,
    scannedBarcode,
    handleBarcodeScanned,
    resumeScan,
    setManualBarcode,
  };
}
