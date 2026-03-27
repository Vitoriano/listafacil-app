import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useCartStore } from '../stores/cartStore';
import { useFinalizePurchase } from '../hooks/useFinalizePurchase';
import { usePurchaseSocket } from '../hooks/usePurchaseSocket';
import { CartItemCard } from './CartItemCard';
import { CartSummaryBar } from './CartSummaryBar';
import { LinkedListBanner } from './LinkedListBanner';
import { LinkedListSelectModal } from './LinkedListSelectModal';
import type { ShoppingList } from '@/features/lists/types';

export function CartScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const cart = useCartStore();
  usePurchaseSocket(cart.purchaseId);
  const { mutate: finalizePurchase, isPending } = useFinalizePurchase();
  const [showListSelect, setShowListSelect] = useState(false);

  useEffect(() => {
    if (!cart.isActive) {
      router.replace('/cart/store-select');
    }
  }, [cart.isActive, router]);

  const linkedProductIds = useMemo(
    () => new Set(cart.linkedListItems.map((li) => li.productId)),
    [cart.linkedListItems],
  );

  const addedFromListCount = useMemo(
    () => cart.items.filter((i) => linkedProductIds.has(i.productId)).length,
    [cart.items, linkedProductIds],
  );

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
    if (cart.items.length === 0 || !cart.purchaseId) return;

    logger.info('Cart', 'Finalizing purchase', cart.purchaseId);
    finalizePurchase(cart.purchaseId, {
      onSuccess: () => {
        logger.info('Cart', 'Purchase finalized');
        cart.reset();
        router.replace('/(tabs)');
      },
    });
  }

  function handleLinkList(list: ShoppingList) {
    logger.info('Cart', 'Linking list', list.id);
    cart.linkList(list.id, list.name, list.items);
    setShowListSelect(false);
  }

  function handleViewLinkedList() {
    router.push(`/lists/${cart.linkedListId}`);
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

      {/* Linked list banner or link button */}
      {cart.linkedListId ? (
        <LinkedListBanner
          listName={cart.linkedListName!}
          addedCount={addedFromListCount}
          totalCount={cart.linkedListItems.length}
          onViewList={handleViewLinkedList}
          onUnlink={cart.unlinkList}
        />
      ) : (
        <TouchableOpacity
          onPress={() => setShowListSelect(true)}
          className="mx-5 mb-3 flex-row items-center gap-3 rounded-2xl border border-dashed border-outline-200 p-3.5"
          activeOpacity={0.7}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-background-100">
            <Ionicons name="link-outline" size={18} color={colors.textTertiary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-typography-700">
              Vincular lista de compras
            </Text>
            <Text className="text-xs text-typography-400">
              Acompanhe o progresso da sua lista
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            isFromList={linkedProductIds.has(item.productId)}
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

      <LinkedListSelectModal
        visible={showListSelect}
        onSelect={handleLinkList}
        onClose={() => setShowListSelect(false)}
      />
    </View>
  );
}
