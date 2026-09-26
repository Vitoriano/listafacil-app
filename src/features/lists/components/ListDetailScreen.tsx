import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { ActiveCartBanner } from './ActiveCartBanner';
import { useListEditorStore } from '../stores/listEditorStore';
import { useListDetail } from '../hooks/useListDetail';
import { useUpdateItem } from '../hooks/useUpdateItem';
import { useRemoveItem } from '../hooks/useRemoveItem';
import { useAddItem } from '../hooks/useAddItem';
import { useListSocket } from '../hooks/useListSocket';
import { useUpdateList } from '../hooks/useUpdateList';
import { useDeleteList } from '../hooks/useDeleteList';
import type { ListItem } from '../types';
import { PAGINATION_LIMIT } from '@/config/constants';
import type { Product } from '@/features/products/types';

export function ListDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  // Lista recém-criada: já abre a busca de produtos (próximo passo natural).
  const [showAddItem, setShowAddItem] = useState(isNew === '1');
  const [showEditName, setShowEditName] = useState(false);
  const [editNameText, setEditNameText] = useState('');

  const colors = useThemeColors();
  const { searchQuery, setSearchQuery, reset: resetEditor } = useListEditorStore();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    q: debouncedSearch || undefined,
    limit: PAGINATION_LIMIT,
  });

  const cart = useCartStore();
  const isLinkedToCart = cart.isActive && cart.linkedListId === id;

  const { data: list, isLoading } = useListDetail(id ?? null);
  const hasItems = (list?.items.length ?? 0) > 0;
  useListSocket(id ?? null);
  const { mutate: updateItem } = useUpdateItem();
  const { mutate: removeItem } = useRemoveItem();
  const { mutate: addItem, isPending: isAddingItem } = useAddItem();
  const { mutate: updateList, isPending: isUpdatingName } = useUpdateList();
  const { mutate: deleteList, isPending: isDeleting } = useDeleteList();

  useEffect(() => {
    return () => {
      resetEditor();
    };
  }, [resetEditor]);

  function handleBack() {
    router.back();
  }

  function handleDeleteList() {
    Alert.alert(
      'Excluir Lista',
      'Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteList(id!, {
              onSuccess: () => {
                // Volta para a lista de listas sem empilhar uma cópia do índice.
                router.dismissTo('/lists');
              },
            });
          },
        },
      ],
    );
  }

  function handleMoreActions() {
    Alert.alert(list?.name ?? 'Lista', undefined, [
      { text: 'Renomear', onPress: handleOpenEditName },
      { text: 'Excluir lista', style: 'destructive', onPress: handleDeleteList },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function handleStartPurchase() {
    if (!list) return;
    if (isLinkedToCart) {
      router.navigate('/cart');
      return;
    }
    if (cart.isActive) {
      Alert.alert(
        'Compra em andamento',
        `Você já está comprando em ${cart.storeName ?? 'um supermercado'}. Deseja acompanhar esta lista nessa compra?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Vincular e ir ao carrinho',
            onPress: () => {
              cart.linkList({ id: list.id, name: list.name, items: list.items });
              router.navigate('/cart');
            },
          },
        ],
      );
      return;
    }
    logger.info('Lists', 'Starting purchase from list', id);
    router.navigate({ pathname: '/cart/store-select', params: { listId: id! } });
  }

  function handleShare() {
    logger.info('Lists', 'Navigating to share', id);
    router.push(`/lists/share?id=${id}`);
  }

  function handleOptimize() {
    logger.info('Lists', 'Navigating to optimize', id);
    router.push(`/lists/optimize?listId=${id}`);
  }

  function handleToggleCheck(item: ListItem) {
    logger.info('Lists', 'Toggling item check', item.id, !item.checked);
    updateItem({ listId: id!, itemId: item.id, data: { checked: !item.checked } });
  }

  function handleRemoveItem(item: ListItem) {
    logger.info('Lists', 'Removing item', item.id);
    removeItem({ listId: id!, itemId: item.id });
  }

  function handleOpenEditName() {
    setEditNameText(list?.name ?? '');
    setShowEditName(true);
  }

  function handleSaveName() {
    const trimmed = editNameText.trim();
    if (!trimmed || trimmed === list?.name) {
      setShowEditName(false);
      return;
    }
    logger.info('Lists', 'Renaming list', id, trimmed);
    updateList(
      { listId: id!, data: { name: trimmed } },
      { onSuccess: () => setShowEditName(false) },
    );
  }

  function handleOpenAddItem() {
    setShowAddItem(true);
  }

  function handleCloseAddItem() {
    setShowAddItem(false);
    setSearchQuery('');
  }

  function handleSelectProduct(product: Product) {
    logger.info('Lists', 'Adding item to list', product.id);
    addItem(
      { listId: id!, item: { productId: product.id, quantity: 1, estimatedPrice: product.latestPrice?.price ?? 0 } },
      {
        onSuccess: () => {
          logger.info('Lists', 'Item added successfully');
          handleCloseAddItem();
        },
      },
    );
  }

  const products = productsData?.data ?? [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title={list?.name || 'Detalhe da Lista'}
        subtitle={
          list
            ? `${list.itemCount ?? 0} ${(list.itemCount ?? 0) === 1 ? 'item' : 'itens'}${list.totalEstimate ? ` · ${formatCurrency(list.totalEstimate)}` : ''}`
            : undefined
        }
        onBack={handleBack}
        rightAction={
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary-50"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar lista"
            >
              <Ionicons name="share-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleMoreActions}
              disabled={isDeleting}
              className="h-10 w-10 items-center justify-center rounded-full bg-background-100"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Mais opções"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        }
      />

      {isLinkedToCart ? (
        <ActiveCartBanner
          storeName={cart.storeName!}
          addedCount={cart.items.filter((ci) =>
            (list?.items ?? []).some((li) => li.productId === ci.productId),
          ).length}
          totalCount={list?.items.length ?? 0}
          onGoToCart={() => router.navigate('/cart')}
        />
      ) : null}

      <FlatList
        data={list?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="Lista Vazia"
            message="Adicione itens a sua lista de compras."
            icon="cart-outline"
            action={{ label: 'Adicionar Item', onPress: handleOpenAddItem }}
          />
        }
        ListFooterComponent={
          hasItems ? (
            <TouchableOpacity
              onPress={handleOptimize}
              accessibilityRole="button"
              accessibilityLabel="Otimizar Compras"
              className="mt-2 flex-row items-center gap-3 rounded-2xl bg-warning-50 p-4"
              activeOpacity={0.7}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-warning-100">
                <Ionicons name="flash" size={20} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-typography-900">Otimizar Compras</Text>
                <Text className="mt-0.5 text-xs text-typography-500">
                  Descubra em qual loja esta lista sai mais barata
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-background-0 p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 flex-row items-start gap-3">
                <TouchableOpacity
                  onPress={() => handleToggleCheck(item)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Marcar ${item.productName}`}
                  accessibilityState={{ checked: item.checked }}
                  className={`mt-0.5 h-6 w-6 items-center justify-center rounded-full border-2 ${
                    item.checked
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-outline-300 bg-background-0'
                  }`}
                  activeOpacity={0.7}
                >
                  {item.checked ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : null}
                </TouchableOpacity>

                <View className="flex-1">
                  <Text
                    className={`text-sm font-bold ${
                      item.checked
                        ? 'text-typography-400 line-through'
                        : 'text-typography-900'
                    }`}
                  >
                    {item.productName}
                  </Text>
                  <Text className="mt-0.5 text-xs text-typography-500">
                    {item.quantity} x {item.unit}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-sm font-bold text-primary-500">
                  {formatCurrency(item.estimatedPrice * item.quantity)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.productName}`}
                  className="mt-2 h-7 w-7 items-center justify-center rounded-full bg-error-50"
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Ações principais na zona do polegar */}
      {hasItems ? (
        <View
          className="flex-row gap-3 bg-background-0 px-5 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 12) + 4,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleOpenAddItem}
            accessibilityRole="button"
            accessibilityLabel="Adicionar Item"
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-3.5"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text className="text-sm font-bold text-primary-500">Adicionar Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStartPurchase}
            accessibilityRole="button"
            accessibilityLabel={isLinkedToCart ? 'Ir ao carrinho' : 'Iniciar Compra'}
            className="flex-[1.2] flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5"
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={20} color={colors.white} />
            <Text className="text-sm font-bold text-white">
              {isLinkedToCart ? 'Ir ao carrinho' : 'Iniciar Compra'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Edit Name Modal */}
      <Modal
        visible={showEditName}
        animationType="fade"
        transparent={false}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowEditName(false)}
      >
        <Pressable
          onPress={() => setShowEditName(false)}
          style={{ flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.background, borderRadius: 16, padding: 20 }}>
            <Text className="mb-4 text-base font-bold text-typography-900">
              Editar nome da lista
            </Text>
            <TextInput
              className="rounded-xl border border-outline-200 bg-background-50 px-4 py-3.5 text-sm text-typography-900"
              value={editNameText}
              onChangeText={setEditNameText}
              placeholder="Nome da lista"
              placeholderTextColor={colors.textQuaternary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              accessibilityLabel="Nome da lista"
            />
            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowEditName(false)}
                className="flex-1 items-center rounded-full border-2 border-outline-200 py-3"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-typography-500">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                disabled={isUpdatingName || !editNameText.trim()}
                className={`flex-1 items-center rounded-full py-3 ${
                  isUpdatingName || !editNameText.trim() ? 'bg-primary-300' : 'bg-primary-500'
                }`}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-bold text-white">
                  {isUpdatingName ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseAddItem}
      >
        <View className="flex-1 bg-background-50">
          <AppHeader title="Adicionar Item" onBack={handleCloseAddItem} />

          <View className="px-4 py-3">
            <View className="flex-row items-center rounded-xl bg-background-100 px-3">
              <Ionicons name="search" size={18} color={colors.textQuaternary} />
              <TextInput
                className="ml-2 flex-1 py-3 text-sm text-typography-900"
                placeholder="Buscar produtos..."
                placeholderTextColor={colors.textQuaternary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Buscar produtos"
                autoFocus
              />
            </View>
          </View>

          {loadingProducts || isAddingItem ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectProduct(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar ${item.name}`}
                  className="mb-2"
                  activeOpacity={0.7}
                >
                  <View className="rounded-2xl bg-background-0 p-3.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-typography-900">
                          {item.name}
                        </Text>
                        <Text className="mt-0.5 text-xs text-typography-500">
                          {item.brand} · {item.unit}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-bold text-primary-500">
                          {item.latestPrice ? formatCurrency(item.latestPrice.price) : 'Sem preco'}
                        </Text>
                        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-500">
                          <Ionicons name="add" size={16} color={colors.white} />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <EmptyState
                  title="Nenhum Produto"
                  message="Tente um termo de busca diferente."
                  icon="search-outline"
                />
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
