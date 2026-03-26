import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  // Camera permission not yet determined or denied — show fallback
  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
        <EmptyState
          title="Permissao de Camera"
          message="Lista Facil precisa de acesso a camera para escanear codigos de barras."
          icon="camera-outline"
          action={{
            label: 'Permitir Acesso',
            onPress: requestPermission,
          }}
        />
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border border-outline-200 py-3.5"
            onPress={() => setShowManualEntry(true)}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="keypad-outline" size={18} color="#EA1D2C" />
            <Text className="text-sm font-semibold text-primary-500">
              Digitar Codigo de Barras
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
      <View className="absolute bottom-36 left-0 right-0 items-center">
        <View className="rounded-full bg-black/50 px-5 py-2.5">
          <Text className="text-sm font-medium text-white">
            Aponte a camera para o codigo de barras
          </Text>
        </View>
      </View>

      {/* Manual entry button */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <TouchableOpacity
          className="flex-row items-center gap-2 rounded-full bg-white/20 px-6 py-3.5"
          onPress={() => setShowManualEntry(true)}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="keypad-outline" size={18} color="#FFFFFF" />
          <Text className="text-sm font-semibold text-white">
            Digitar Codigo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay during product lookup */}
      {isLoading && scannedBarcode ? (
        <View className="absolute inset-0 items-center justify-center bg-black/60">
          <View className="rounded-2xl bg-white p-6">
            <LoadingSpinner size="large" />
            <Text className="mt-3 text-sm font-medium text-typography-700">
              Buscando produto...
            </Text>
          </View>
        </View>
      ) : null}

      {/* Product not found bottom sheet */}
      {showNotFound ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background-0 px-6 pb-10 pt-6">
          <View className="mb-4 self-center h-1 w-10 rounded-full bg-outline-200" />
          <Text className="mb-2 text-xl font-bold text-typography-900">
            Produto Nao Encontrado
          </Text>
          <Text className="mb-6 text-sm text-typography-500">
            Nenhum produto encontrado para o codigo{' '}
            <Text className="font-mono font-semibold text-typography-900">{scannedBarcode}</Text>.
          </Text>
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5"
            onPress={() => {
              setShowNotFound(false);
              setShowManualEntry(true);
            }}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Ionicons name="keypad-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">
              Digitar Codigo Manualmente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border border-outline-200 py-3.5"
            onPress={handleDismissNotFound}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="scan-outline" size={18} color="#323232" />
            <Text className="text-sm font-semibold text-typography-700">
              Escanear Novamente
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
