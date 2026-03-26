export type ScannerPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface BarcodeResult {
  type: string;
  data: string;
}

export interface ScannerState {
  permissionStatus: ScannerPermissionStatus;
  isScanning: boolean;
  scannedBarcode: string | null;
}
