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
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
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
        title={list?.name ?? 'List Detail'}
        subtitle={
          list
            ? `${list.itemCount} ${list.itemCount === 1 ? 'item' : 'items'} · ${formatCurrency(list.totalEstimate)}`
            : undefined
        }
        onBack={handleBack}
      />

      <FlatList
        data={list?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="No Items Yet"
            message="Add items to your shopping list."
            action={{ label: 'Add Item', onPress: handleOpenAddItem }}
          />
        }
        ListFooterComponent={
          list && list.items.length > 0 ? (
            <VStack className="mt-4 gap-3">
              <TouchableOpacity
                onPress={handleOpenAddItem}
                accessibilityRole="button"
                accessibilityLabel="Add Item"
                className="items-center rounded-xl border border-primary-500 py-3"
              >
                <Text className="text-base font-semibold text-primary-500">
                  + Add Item
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOptimize}
                accessibilityRole="button"
                accessibilityLabel="Optimize"
                className="items-center rounded-xl bg-primary-500 py-4"
              >
                <Text className="text-base font-semibold text-white">
                  Optimize
                </Text>
              </TouchableOpacity>
            </VStack>
          ) : null
        }
        renderItem={({ item }) => (
          <Box className="mb-3 rounded-xl bg-background-0 p-4 shadow-sm">
            <HStack className="items-start justify-between">
              <HStack className="flex-1 items-start gap-3">
                <TouchableOpacity
                  onPress={() => handleToggleCheck(item)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Toggle ${item.productName}`}
                  accessibilityState={{ checked: item.checked }}
                  className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                    item.checked
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-outline-300 bg-background-0'
                  }`}
                >
                  {item.checked ? (
                    <Text className="text-xs text-white">✓</Text>
                  ) : null}
                </TouchableOpacity>

                <VStack className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      item.checked
                        ? 'text-typography-400 line-through'
                        : 'text-typography-900'
                    }`}
                  >
                    {item.productName}
                  </Text>
                  <Text className="mt-0.5 text-sm text-typography-500">
                    {item.quantity} × {item.unit}
                  </Text>
                </VStack>
              </HStack>

              <VStack className="items-end">
                <Text className="text-base font-bold text-primary-600">
                  {formatCurrency(item.estimatedPrice * item.quantity)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.productName}`}
                  className="mt-2 rounded-lg bg-error-100 px-2 py-1"
                >
                  <Text className="text-xs text-error-600">Remove</Text>
                </TouchableOpacity>
              </VStack>
            </HStack>
          </Box>
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
          <AppHeader title="Add Item" onBack={handleCloseAddItem} />

          <Box className="px-4 py-3">
            <TextInput
              className="rounded-lg border border-outline-200 bg-background-0 px-3 py-2 text-base text-typography-900"
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search products"
              autoFocus
            />
          </Box>

          {loadingProducts || isAddingItem ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 12, flexGrow: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectProduct(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${item.name}`}
                  className="mb-2"
                >
                  <Box className="rounded-xl bg-background-0 p-3 shadow-sm">
                    <HStack className="items-center justify-between">
                      <VStack className="flex-1">
                        <Text className="text-sm font-semibold text-typography-900">
                          {item.name}
                        </Text>
                        <Text className="text-xs text-typography-500">
                          {item.brand} · {item.unit}
                        </Text>
                      </VStack>
                      <Text className="text-sm font-bold text-primary-600">
                        {formatCurrency(item.lowestPrice)}
                      </Text>
                    </HStack>
                  </Box>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <EmptyState
                  title="No Products Found"
                  message="Try a different search term."
                />
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
