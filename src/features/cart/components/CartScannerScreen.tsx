import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useScanner } from '@/features/scanner/hooks/useScanner';
import { useBarcodeResult } from '@/features/scanner/hooks/useBarcodeResult';
import { ScannerOverlay } from '@/features/scanner/components/ScannerOverlay';
import { ManualEntryModal } from '@/features/scanner/components/ManualEntryModal';
import { useCartStore } from '../stores/cartStore';
import { PriceEntryModal } from './PriceEntryModal';
import type { Product } from '@/features/products/types';

export function CartScannerScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const addItem = useCartStore((s) => s.addItem);

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

  const { data: product, isLoading, isFetched } = useBarcodeResult(scannedBarcode);

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [showPriceEntry, setShowPriceEntry] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!permissionDetermined || (!permissionGranted && canAskAgain)) {
      requestPermission();
    }
  }, [permissionDetermined, permissionGranted, canAskAgain, requestPermission]);

  useEffect(() => {
    if (isFetched && scannedBarcode) {
      if (product) {
        logger.info('CartScanner', 'Product found', product.id);
        setShowNotFound(false);
        setFoundProduct(product);
        setShowPriceEntry(true);
      } else {
        logger.info('CartScanner', 'Product not found', scannedBarcode);
        setShowNotFound(true);
      }
    }
  }, [isFetched, product, scannedBarcode]);

  function handleManualSubmit(barcode: string) {
    setShowManualEntry(false);
    setShowNotFound(false);
    setManualBarcode(barcode);
  }

  function handleDismissNotFound() {
    setShowNotFound(false);
    resumeScan();
  }

  function handleAddToCart(price: number, quantity: number) {
    if (!foundProduct) return;
    logger.info('CartScanner', 'Adding to cart', foundProduct.id, price, quantity);
    addItem({
      productId: foundProduct.id,
      productName: foundProduct.name,
      barcode: foundProduct.barcode,
      price,
      quantity,
    });
    setShowPriceEntry(false);
    setFoundProduct(null);
    resumeScan();
  }

  function handleClosePriceEntry() {
    setShowPriceEntry(false);
    setFoundProduct(null);
    resumeScan();
  }

  if (!permissionDetermined) {
    return <LoadingSpinner />;
  }

  if (!permissionGranted) {
    return (
      <View className="flex-1 bg-background-50">
        <EmptyState
          title="Permissao de Camera"
          message={
            canAskAgain
              ? 'Lista Facil precisa de acesso a camera para escanear codigos de barras.'
              : 'Permissao negada. Abra as configuracoes do app para permitir.'
          }
          icon="camera-outline"
          action={{
            label: canAskAgain ? 'Permitir Acesso' : 'Abrir Configuracoes',
            onPress: canAskAgain ? requestPermission : openSettings,
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a'] }}
        onBarcodeScanned={isPaused ? undefined : handleBarcodeScanned}
      />

      <ScannerOverlay />

      {/* Back button */}
      <View className="absolute left-5 top-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Cart badge */}
      <View className="absolute right-5 top-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 rounded-full bg-primary-500 px-3.5 py-2"
          activeOpacity={0.7}
        >
          <Ionicons name="cart" size={16} color={colors.white} />
          <Text className="text-xs font-bold text-white">
            {useCartStore.getState().itemCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      <View className="absolute bottom-36 left-0 right-0 items-center">
        <View className="rounded-full bg-black/50 px-5 py-2.5">
          <Text className="text-sm font-medium text-white">
            Escaneie o produto para adicionar
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
          <Text className="text-sm font-semibold text-white">Digitar Codigo</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
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

      {/* Product not found */}
      {showNotFound ? (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background-0 px-6 pb-10 pt-6">
          <View className="mb-4 self-center h-1 w-10 rounded-full bg-outline-200" />
          <Text className="mb-2 text-xl font-bold text-typography-900">
            Produto Nao Encontrado
          </Text>
          <Text className="mb-6 text-sm text-typography-500">
            Codigo: <Text className="font-mono font-semibold text-typography-900">{scannedBarcode}</Text>
          </Text>
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5"
            onPress={() => {
              setShowNotFound(false);
              setShowManualEntry(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="keypad-outline" size={18} color={colors.white} />
            <Text className="text-sm font-bold text-white">Digitar Codigo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full border border-outline-200 py-3.5"
            onPress={handleDismissNotFound}
            activeOpacity={0.7}
          >
            <Ionicons name="scan-outline" size={18} color={colors.icon} />
            <Text className="text-sm font-semibold text-typography-700">Escanear Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <PriceEntryModal
        visible={showPriceEntry}
        product={foundProduct}
        onAdd={handleAddToCart}
        onClose={handleClosePriceEntry}
      />

      <ManualEntryModal
        visible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSubmit={handleManualSubmit}
      />
    </View>
  );
}
