import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { ProductNotFoundSheet } from '@/features/scanner/components/ProductNotFoundSheet';
import type { BarcodeResult } from '@/features/scanner/types';
import { useUpdateItem } from '@/features/lists/hooks/useUpdateItem';
import { useCartStore } from '../stores/cartStore';
import { PriceEntryModal } from './PriceEntryModal';
import type { Product } from '@/features/products/types';

export function CartScannerScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const cartItemCount = useCartStore((s) => s.itemCount);
  const linkedListId = useCartStore((s) => s.linkedListId);
  const linkedListItems = useCartStore((s) => s.linkedListItems);
  const { mutate: updateListItem } = useUpdateItem();

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
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const lastNotFoundRef = useRef<{ code: string; at: number } | null>(null);
  const [showPriceEntry, setShowPriceEntry] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  // List progress
  const linkedProductIds = new Set(linkedListItems.map((li) => li.productId));
  const addedFromList = cartItems.filter((i) => linkedProductIds.has(i.productId)).length;
  const remainingFromList = linkedListItems.length - addedFromList;

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
        // Aviso não bloqueante: a câmera segue ativa para o próximo produto.
        lastNotFoundRef.current = { code: scannedBarcode, at: Date.now() };
        setNotFoundBarcode(scannedBarcode);
        setShowNotFound(true);
        resumeScan();
      }
    }
  }, [isFetched, product, scannedBarcode, resumeScan]);

  const handleScan = useCallback(
    (result: BarcodeResult) => {
      const last = lastNotFoundRef.current;
      if (last && last.code === result.data && Date.now() - last.at < 3000) {
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

  function handleAddToCart(price: number, quantity: number) {
    if (!foundProduct) return;

    const matchingListItem = linkedListId
      ? linkedListItems.find((li) => li.productId === foundProduct.id && !li.checked)
      : null;

    logger.info('CartScanner', 'Adding to cart', foundProduct.id, price, quantity);
    addItem({
      productId: foundProduct.id,
      productName: foundProduct.name,
      barcode: foundProduct.barcode,
      price,
      quantity,
      fromListId: matchingListItem ? linkedListId! : undefined,
    });

    // Auto-check linked list item
    if (matchingListItem && linkedListId) {
      updateListItem({
        listId: linkedListId,
        itemId: matchingListItem.id,
        data: { checked: true },
      });
    }

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
        onBarcodeScanned={isPaused ? undefined : handleScan}
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
          <Text className="text-xs font-bold text-white">{cartItemCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Linked list remaining chip */}
      {linkedListId && remainingFromList > 0 ? (
        <View className="absolute left-0 right-0 top-28 items-center">
          <View className="flex-row items-center gap-1.5 rounded-full bg-white/90 px-4 py-2">
            <Ionicons name="list" size={14} color={colors.primary} />
            <Text className="text-xs font-semibold text-typography-700">
              {remainingFromList > 0
                ? `Faltam ${remainingFromList} itens da lista`
                : 'Todos os itens da lista adicionados!'}
            </Text>
          </View>
        </View>
      ) : null}

      {linkedListId && remainingFromList === 0 && linkedListItems.length > 0 ? (
        <View className="absolute left-0 right-0 top-28 items-center">
          <View className="flex-row items-center gap-1.5 rounded-full bg-success-500/90 px-4 py-2">
            <Ionicons name="checkmark-circle" size={14} color={colors.white} />
            <Text className="text-xs font-bold text-white">
              Lista completa!
            </Text>
          </View>
        </View>
      ) : null}

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

      <ProductNotFoundSheet
        visible={showNotFound && !showPriceEntry}
        barcode={notFoundBarcode}
        onManualEntry={() => {
          setShowNotFound(false);
          setShowManualEntry(true);
        }}
        onDismiss={handleDismissNotFound}
      />

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
