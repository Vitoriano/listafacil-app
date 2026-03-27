import React, { useState } from 'react';
import { FlatList, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { logger } from '@/shared/utils/logger';
import { PAGINATION_LIMIT } from '@/config/constants';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useProductFilterStore } from '../stores/productFilterStore';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';
import { useRouter } from 'expo-router';

export function ProductListScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { search, categoryId, setSearch, setCategoryId } =
    useProductFilterStore();

  const [inputValue, setInputValue] = useState(search);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(inputValue, 300);

  const { data: categories } = useCategories();

  const { data, isLoading } = useProducts({
    q: debouncedSearch || undefined,
    categoryId,
    page,
    limit: PAGINATION_LIMIT,
  });

  function handleSearchChange(text: string) {
    setInputValue(text);
    setSearch(text);
    setPage(1);
    logger.info('Products', 'Search changed', text);
  }

  function handleCategorySelect(catId: number | undefined) {
    setCategoryId(catId);
    setPage(1);
    logger.info('Products', 'Category selected', String(catId));
  }

  function handleLoadMore() {
    if (data?.hasMore) {
      setPage((p) => p + 1);
    }
  }

  function handleProductPress(product: Product) {
    router.push(`/products/${product.id}`);
  }

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  if (isLoading && page === 1) {
    return <LoadingSpinner />;
  }

  const categoryOptions = [
    { id: undefined, name: 'Todos' },
    ...(categories ?? []).map((c) => ({ id: c.id as number | undefined, name: c.name })),
  ];

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      {/* Header */}
      <View className="bg-background-0 px-5 pb-3 pt-4">
        <Text className="mb-3 text-2xl font-bold text-typography-900">Produtos</Text>

        {/* Search input */}
        <View className="flex-row items-center rounded-2xl bg-background-50 px-4">
          <Ionicons name="search" size={18} color={colors.textQuaternary} />
          <TextInput
            className="ml-2 flex-1 py-3 text-sm text-typography-900"
            placeholder="Buscar por nome ou marca..."
            placeholderTextColor={colors.textQuaternary}
            value={inputValue}
            onChangeText={handleSearchChange}
            accessibilityLabel="Buscar produtos"
            returnKeyType="search"
          />
          {inputValue ? (
            <TouchableOpacity onPress={() => handleSearchChange('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textQuaternary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category filter */}
      <View className="bg-background-0 pb-3">
        <FlatList
          horizontal
          data={categoryOptions}
          keyExtractor={(item) => String(item.id ?? 'all')}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${item.name}`}
              activeOpacity={0.7}
            >
              <View
                className={`rounded-full px-4 py-2 ${
                  categoryId === item.id
                    ? 'bg-primary-500'
                    : 'bg-background-50'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    categoryId === item.id
                      ? 'text-white'
                      : 'text-typography-600'
                  }`}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product list */}
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum produto encontrado"
            message="Tente ajustar sua busca ou filtro."
            icon="search-outline"
          />
        }
        ListFooterComponent={
          isLoading && page > 1 ? <LoadingSpinner size="small" /> : null
        }
      />
    </View>
  );
}
