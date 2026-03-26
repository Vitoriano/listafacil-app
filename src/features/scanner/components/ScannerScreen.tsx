import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { logger } from '@/shared/utils/logger';
import { useScanner } from '../hooks/useScanner';
import { useBarcodeResult } from '../hooks/useBarcodeResult';
import { ScannerOverlay } from './ScannerOverlay';
import { ManualEntryModal } from './ManualEntryModal';

export function ScannerScreen() {
  const router = useRouter();
  const {
    permissionGranted,
    requestPermission,
    isPaused,
    scannedBarcode,
    handleBarcodeScanned,
    resumeScan,
    setManualBarcode,
  } = useScanner();

  const { data: product, isLoading, isFetched } = useBarcodeResult(scannedBarcode);

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Navigate to product detail when found
  useEffect(() => {
    if (isFetched && scannedBarcode) {
      if (product) {
        logger.info('Scanner', 'Product found, navigating', product.id);
        setShowNotFound(false);
        router.push(`/products/${product.id}`);
        // Resume scan after navigation so the user can scan again
        resumeScan();
      } else {
        logger.info('Scanner', 'Product not found for barcode', scannedBarcode);
        setShowNotFound(true);
      }
    }
  }, [isFetched, product, scannedBarcode, router, resumeScan]);

  function handleManualSubmit(barcode: string) {
    setShowManualEntry(false);
    setShowNotFound(false);
    setManualBarcode(barcode);
  }

  function handleDismissNotFound() {
    setShowNotFound(false);
    resumeScan();
  }

  // Camera permission not yet determined or denied — show fallback
  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-background-50">
        <EmptyState
          title="Camera Permission Required"
          message="Lista Fácil needs camera access to scan barcodes."
          action={{
            label: 'Grant Permission',
            onPress: requestPermission,
          }}
        />
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="items-center rounded-lg border border-outline-300 py-3"
            onPress={() => setShowManualEntry(true)}
            accessibilityRole="button"
          >
            <Text className="text-base font-medium text-primary-500">
              Enter Barcode Manually
            </Text>
          </TouchableOpacity>
        </View>

        <ManualEntryModal
          visible={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          onSubmit={handleManualSubmit}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'upc_a'],
        }}
        onBarcodeScanned={isPaused ? undefined : handleBarcodeScanned}
      />

      <ScannerOverlay />

      {/* Instruction label */}
      <View className="absolute bottom-40 left-0 right-0 items-center">
        <View className="rounded-full bg-black/60 px-4 py-2">
          <Text className="text-sm text-white">
            Point camera at a barcode to scan
          </Text>
        </View>
      </View>

      {/* Manual entry button */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <TouchableOpacity
          className="rounded-full bg-white/20 px-6 py-3"
          onPress={() => setShowManualEntry(true)}
          accessibilityRole="button"
        >
          <Text className="text-base font-medium text-white">
            Enter Barcode Manually
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay during product lookup */}
      {isLoading && scannedBarcode ? (
        <View className="absolute inset-0 items-center justify-center bg-black/70">
          <LoadingSpinner />
        </View>
      ) : null}

      {/* Product not found bottom sheet */}
      {showNotFound ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background-50 px-6 pb-10 pt-6">
          <Text className="mb-2 text-xl font-bold text-typography-900">
            Product Not Found
          </Text>
          <Text className="mb-6 text-base text-typography-500">
            No product matched barcode{' '}
            <Text className="font-mono text-typography-900">{scannedBarcode}</Text>.
          </Text>
          <TouchableOpacity
            className="mb-3 items-center rounded-lg bg-primary-500 py-3"
            onPress={() => {
              setShowNotFound(false);
              setShowManualEntry(true);
            }}
            accessibilityRole="button"
          >
            <Text className="text-base font-semibold text-white">
              Enter Barcode Manually
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center rounded-lg border border-outline-300 py-3"
            onPress={handleDismissNotFound}
            accessibilityRole="button"
          >
            <Text className="text-base font-medium text-typography-700">
              Scan Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ManualEntryModal
        visible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
}
