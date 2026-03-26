import React, { useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useCartStore } from '../stores/cartStore';
import { useCreatePurchase } from '../hooks/useCreatePurchase';
import { CartItemCard } from './CartItemCard';
import { CartSummaryBar } from './CartSummaryBar';
import type { Purchase } from '../types';

export function CartScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const cart = useCartStore();
  const { mutate: createPurchase, isPending } = useCreatePurchase();

  useEffect(() => {
    if (!cart.isActive) {
      router.replace('/cart/store-select');
    }
  }, [cart.isActive, router]);

  if (!cart.isActive) {
    return <LoadingSpinner />;
  }

  function handleBack() {
    router.back();
  }

  function handleScan() {
    router.push('/cart/scanner');
  }

  function handleFinalize() {
    if (cart.items.length === 0) return;

    const now = new Date().toISOString();
    const purchase: Purchase = {
      id: cart.purchaseId!,
      storeId: cart.storeId!,
      storeName: cart.storeName!,
      date: now,
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
      status: 'completed',
      createdAt: now,
      completedAt: now,
    };

    logger.info('Cart', 'Finalizing purchase', purchase.id);
    createPurchase(purchase, {
      onSuccess: () => {
        logger.info('Cart', 'Purchase finalized');
        cart.reset();
        router.replace('/(tabs)');
      },
    });
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title="Carrinho"
        subtitle={cart.storeName ?? undefined}
        onBack={handleBack}
        rightAction={
          <TouchableOpacity
            onPress={handleScan}
            className="flex-row items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5"
            accessibilityRole="button"
            accessibilityLabel="Escanear produto"
            activeOpacity={0.8}
          >
            <Ionicons name="barcode-outline" size={16} color={colors.white} />
            <Text className="text-xs font-bold text-white">Escanear</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={cart.updateItemQuantity}
            onRemove={cart.removeItem}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Carrinho Vazio"
            message="Escaneie produtos para adicionar ao carrinho."
            icon="cart-outline"
            action={{ label: 'Escanear Produto', onPress: handleScan }}
          />
        }
      />

      {cart.items.length > 0 ? (
        <CartSummaryBar
          total={cart.total}
          itemCount={cart.itemCount}
          onFinalize={handleFinalize}
          isPending={isPending}
        />
      ) : null}
    </View>
  );
}
