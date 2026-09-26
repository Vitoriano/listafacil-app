import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { useCartStore } from '../stores/cartStore';
import { useFinalizePurchase } from '../hooks/useFinalizePurchase';
import { usePurchaseSocket } from '../hooks/usePurchaseSocket';
import { CartItemCard } from './CartItemCard';
import { CartSummaryBar } from './CartSummaryBar';
import { LinkedListBanner } from './LinkedListBanner';
import { LinkedListSelectModal } from './LinkedListSelectModal';
import { StartPurchaseScreen } from './StartPurchaseScreen';
import type { ShoppingList } from '@/features/lists/types';

/**
 * Aba "Comprar". Sem sessão ativa mostra a tela de início de compra no lugar
 * de redirecionar (evita telas fantasmas na pilha e "voltar" imprevisível).
 */
export function CartScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const cart = useCartStore();
  usePurchaseSocket(cart.purchaseId);
  const { mutate: finalizePurchase, isPending } = useFinalizePurchase();
  const [showListSelect, setShowListSelect] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const linkedProductIds = useMemo(
    () => new Set(cart.linkedListItems.map((li) => li.productId)),
    [cart.linkedListItems],
  );

  const addedFromListCount = useMemo(
    () => cart.items.filter((i) => linkedProductIds.has(i.productId)).length,
    [cart.items, linkedProductIds],
  );

  if (!cart.isActive) {
    if (cart.isHydrating) {
      return <LoadingSpinner />;
    }
    return <StartPurchaseScreen />;
  }

  function handleScan() {
    router.push('/scan/cart');
  }

  function handleFinalize() {
    if (cart.items.length === 0 || !cart.purchaseId) return;
    const purchaseId = cart.purchaseId;
    Alert.alert(
      'Finalizar Compra',
      `Confirma a finalização da compra com ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'itens'} totalizando ${formatCurrency(cart.total)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            logger.info('Cart', 'Finalizing purchase', purchaseId);
            finalizePurchase(purchaseId, {
              onSuccess: () => {
                logger.info('Cart', 'Purchase finalized');
                cart.reset();
                // Recibo da compra empilhado sobre as abas; "voltar" retorna à aba Comprar.
                router.push(`/purchases/${purchaseId}?completed=1`);
              },
              onError: () => {
                Alert.alert('Erro', 'Não foi possível finalizar a compra. Tente novamente.');
              },
            });
          },
        },
      ],
    );
  }

  function handleCancelPurchase() {
    Alert.alert(
      'Cancelar compra',
      cart.items.length > 0
        ? `Os ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'itens'} do carrinho serão descartados. Deseja cancelar?`
        : 'Deseja cancelar esta compra?',
      [
        { text: 'Continuar comprando', style: 'cancel' },
        {
          text: 'Cancelar compra',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cart.cancelSession();
            } catch (error) {
              logger.error('Cart', 'Failed to cancel purchase', error);
              Alert.alert('Erro', 'Não foi possível cancelar a compra.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  }

  function handleLinkList(list: ShoppingList) {
    logger.info('Cart', 'Linking list', list.id);
    cart.linkList({ id: list.id, name: list.name, items: list.items });
    setShowListSelect(false);
  }

  function handleViewLinkedList() {
    // Troca para a aba Listas (sem empilhar uma segunda cópia das abas).
    router.navigate(`/lists/${cart.linkedListId}`);
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title="Carrinho"
        subtitle={cart.storeName ?? undefined}
        rightAction={
          <TouchableOpacity
            onPress={handleCancelPurchase}
            disabled={isCancelling}
            className="h-10 w-10 items-center justify-center rounded-full bg-background-50"
            accessibilityRole="button"
            accessibilityLabel="Cancelar compra"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={colors.icon} />
          </TouchableOpacity>
        }
      />

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
          accessibilityRole="button"
          accessibilityLabel="Vincular lista de compras"
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
            message="Escaneie os produtos conforme coloca no carrinho."
            icon="cart-outline"
          />
        }
      />

      <CartSummaryBar
        total={cart.total}
        itemCount={cart.itemCount}
        onScan={handleScan}
        onFinalize={handleFinalize}
        isPending={isPending}
      />

      <LinkedListSelectModal
        visible={showListSelect}
        onSelect={handleLinkList}
        onClose={() => setShowListSelect(false)}
      />
    </View>
  );
}
