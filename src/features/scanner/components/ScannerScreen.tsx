import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useScanner } from '../hooks/useScanner';
import { useBarcodeResult } from '../hooks/useBarcodeResult';
import { ScannerOverlay } from './ScannerOverlay';
import { ManualEntryModal } from './ManualEntryModal';
import { ProductNotFoundSheet } from './ProductNotFoundSheet';
import type { BarcodeResult } from '../types';

/** Depois de um "não encontrado", ignora o mesmo código por este tempo (evita repique). */
const SAME_CODE_COOLDOWN_MS = 3000;

export function ScannerScreen() {
  const router = useRouter();
  const {
    permissionGranted,
    permissionDetermined,
    canAskAgain,
    requestPermission,
    openSettings,
    isPaused,
    scannedBarcode,
    handleBarcodeScanned,
    resumeScan,
    setManualBarcode,
  } = useScanner();

  const colors = useThemeColors();
  const { data: product, isLoading, isFetched } = useBarcodeResult(scannedBarcode);

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const lastNotFoundRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    if (!permissionDetermined || (!permissionGranted && canAskAgain)) {
      requestPermission();
    }
  }, [permissionDetermined, permissionGranted, canAskAgain, requestPermission]);

  useEffect(() => {
    if (isFetched && scannedBarcode) {
      if (product) {
        logger.info('Scanner', 'Product found, navigating', product.id);
        setShowNotFound(false);
        // Fecha a câmera e abre o produto dentro da aba Produtos (sem duplicar as abas).
        router.dismissTo(`/products/${product.id}`);
        resumeScan();
      } else {
        logger.info('Scanner', 'Product not found for barcode', scannedBarcode);
        // Mostra o aviso e já libera a câmera: o usuário só precisa apontar para outro código.
        lastNotFoundRef.current = { code: scannedBarcode, at: Date.now() };
        setNotFoundBarcode(scannedBarcode);
        setShowNotFound(true);
        resumeScan();
      }
    }
  }, [isFetched, product, scannedBarcode, router, resumeScan]);

  const handleScan = useCallback(
    (result: BarcodeResult) => {
      const last = lastNotFoundRef.current;
      if (last && last.code === result.data && Date.now() - last.at < SAME_CODE_COOLDOWN_MS) {
        return;
      }
      handleBarcodeScanned(result);
    },
    [handleBarcodeScanned],
  );

  function handleManualSubmit(barcode: string) {
    setShowManualEntry(false);
    setShowNotFound(false);
    lastNotFoundRef.current = null;
    setManualBarcode(barcode);
  }

  const handleDismissNotFound = useCallback(() => {
    setShowNotFound(false);
  }, []);

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  // Still loading permission status
  if (!permissionDetermined) {
    return <LoadingSpinner />;
  }

  // Permission denied — show appropriate message
  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
        <EmptyState
          title="Permissao de Camera"
          message={
            canAskAgain
              ? 'Lista Facil precisa de acesso a camera para escanear codigos de barras.'
              : 'Permissao de camera negada. Abra as configuracoes do app para permitir o acesso.'
          }
          icon="camera-outline"
          action={{
            label: canAskAgain ? 'Permitir Acesso' : 'Abrir Configuracoes',
            onPress: canAskAgain ? requestPermission : openSettings,
          }}
        />
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border border-outline-200 py-3.5"
            onPress={() => setShowManualEntry(true)}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="keypad-outline" size={18} color={colors.primary} />
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
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'upc_a'],
        }}
        onBarcodeScanned={isPaused ? undefined : handleScan}
      />

      <ScannerOverlay />

      {/* Back button */}
      <View className="absolute left-5 top-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

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
          <Ionicons name="keypad-outline" size={18} color={colors.white} />
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

      <ProductNotFoundSheet
        visible={showNotFound}
        barcode={notFoundBarcode}
        onManualEntry={() => {
          setShowNotFound(false);
          setShowManualEntry(true);
        }}
        onDismiss={handleDismissNotFound}
      />

      <ManualEntryModal
        visible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
}
