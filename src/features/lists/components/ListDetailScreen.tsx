import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
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
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { productRepository } from '@/data/repositories';
import { useListEditorStore } from '../stores/listEditorStore';
import { useListDetail } from '../hooks/useListDetail';
import { useUpdateItem } from '../hooks/useUpdateItem';
import { useRemoveItem } from '../hooks/useRemoveItem';
import { useAddItem } from '../hooks/useAddItem';
import type { ListItem } from '../types';
import type { Product } from '@/features/products/types';

export function ListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showAddItem, setShowAddItem] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { searchQuery, setSearchQuery, reset: resetEditor } = useListEditorStore();

  const { data: list, isLoading } = useListDetail(id ?? null);
  const { mutate: updateItem } = useUpdateItem();
  const { mutate: removeItem } = useRemoveItem();
  const { mutate: addItem, isPending: isAddingItem } = useAddItem();

  useEffect(() => {
    return () => {
      resetEditor();
    };
  }, [resetEditor]);

  function handleBack() {
    router.back();
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

  function handleOpenAddItem() {
    setLoadingProducts(true);
    productRepository
      .getAll({ limit: 50 })
      .then((result) => {
        setProducts(result.data);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
    setShowAddItem(true);
  }

  function handleCloseAddItem() {
    setShowAddItem(false);
    setSearchQuery('');
  }

  function handleSelectProduct(product: Product) {
    logger.info('Lists', 'Adding item to list', product.id);
    addItem(
      { listId: id!, item: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          logger.info('Lists', 'Item added successfully');
          handleCloseAddItem();
        },
      },
    );
  }

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title={list?.name ?? 'Detalhe da Lista'}
        subtitle={
          list
            ? `${list.itemCount} ${list.itemCount === 1 ? 'item' : 'itens'} · ${formatCurrency(list.totalEstimate)}`
            : undefined
        }
        onBack={handleBack}
      />

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
          list && list.items.length > 0 ? (
            <View className="mt-4 gap-3">
              <TouchableOpacity
                onPress={handleOpenAddItem}
                accessibilityRole="button"
                accessibilityLabel="Adicionar Item"
                className="flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-3.5"
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#EA1D2C" />
                <Text className="text-sm font-bold text-primary-500">
                  Adicionar Item
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOptimize}
                accessibilityRole="button"
                accessibilityLabel="Otimizar"
                className="flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white">
                  Otimizar Compras
                </Text>
              </TouchableOpacity>
            </View>
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
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
                  <Ionicons name="trash-outline" size={14} color="#C41C1C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

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
              <Ionicons name="search" size={18} color="#A8A8A8" />
              <TextInput
                className="ml-2 flex-1 py-3 text-sm text-typography-900"
                placeholder="Buscar produtos..."
                placeholderTextColor="#A8A8A8"
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
              data={filteredProducts}
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
                          {formatCurrency(item.lowestPrice)}
                        </Text>
                        <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-500">
                          <Ionicons name="add" size={16} color="#FFFFFF" />
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
