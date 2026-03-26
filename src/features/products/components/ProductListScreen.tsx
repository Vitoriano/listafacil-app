import React, { useState } from 'react';
import { FlatList, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { logger } from '@/shared/utils/logger';
import { PAGINATION_LIMIT } from '@/config/constants';
import { useProducts } from '../hooks/useProducts';
import { useProductFilterStore } from '../stores/productFilterStore';
import { ProductCard } from './ProductCard';
import type { Product, ProductCategory } from '../types';
import { useRouter } from 'expo-router';

const CATEGORIES: { label: string; value: ProductCategory | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Frutas', value: 'fruits' },
  { label: 'Verduras', value: 'vegetables' },
  { label: 'Laticinios', value: 'dairy' },
  { label: 'Carnes', value: 'meat' },
  { label: 'Padaria', value: 'bakery' },
  { label: 'Bebidas', value: 'beverages' },
  { label: 'Graos', value: 'grains' },
  { label: 'Snacks', value: 'snacks' },
  { label: 'Congelados', value: 'frozen' },
  { label: 'Limpeza', value: 'cleaning' },
  { label: 'Higiene', value: 'hygiene' },
  { label: 'Outros', value: 'other' },
];

const SORT_OPTIONS: { label: string; value: 'name' | 'price' | 'recent'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Nome', value: 'name', icon: 'text-outline' },
  { label: 'Preco', value: 'price', icon: 'pricetag-outline' },
  { label: 'Recentes', value: 'recent', icon: 'time-outline' },
];

export function ProductListScreen() {
  const router = useRouter();
  const { search, category, sortBy, setSearch, setCategory, setSortBy } =
    useProductFilterStore();

  const [inputValue, setInputValue] = useState(search);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(inputValue, 300);

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    category,
    sortBy,
    page,
    limit: PAGINATION_LIMIT,
  });

  function handleSearchChange(text: string) {
    setInputValue(text);
    setSearch(text);
    setPage(1);
    logger.info('Products', 'Search changed', text);
  }

  function handleCategorySelect(cat: ProductCategory | undefined) {
    setCategory(cat);
    setPage(1);
    logger.info('Products', 'Category selected', cat);
  }

  function handleSortSelect(sort: 'name' | 'price' | 'recent') {
    setSortBy(sort);
    setPage(1);
    logger.info('Products', 'Sort changed', sort);
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

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      {/* Header */}
      <View className="bg-background-0 px-4 pb-3 pt-4">
        <Text className="mb-3 text-2xl font-bold text-typography-900">Produtos</Text>

        {/* Search input */}
        <View className="flex-row items-center rounded-xl bg-background-50 px-3">
          <Ionicons name="search" size={18} color="#A8A8A8" />
          <TextInput
            className="ml-2 flex-1 py-3 text-sm text-typography-900"
            placeholder="Buscar por nome ou marca..."
            placeholderTextColor="#A8A8A8"
            value={inputValue}
            onChangeText={handleSearchChange}
            accessibilityLabel="Buscar produtos"
            returnKeyType="search"
          />
          {inputValue ? (
            <TouchableOpacity onPress={() => handleSearchChange('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#A8A8A8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sort controls */}
        <View className="mt-3 flex-row gap-2">
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSortSelect(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={`Ordenar por ${opt.label}`}
              activeOpacity={0.7}
            >
              <View
                className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${
                  sortBy === opt.value
                    ? 'bg-primary-500'
                    : 'bg-background-50'
                }`}
              >
                <Ionicons
                  name={opt.icon}
                  size={14}
                  color={sortBy === opt.value ? '#FFFFFF' : '#5A5A5A'}
                />
                <Text
                  className={`text-xs font-semibold ${
                    sortBy === opt.value ? 'text-white' : 'text-typography-600'
                  }`}
                >
                  {opt.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category filter */}
      <View className="bg-background-0 border-b border-outline-100 pb-3">
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.value ?? 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.value)}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${item.label}`}
              activeOpacity={0.7}
            >
              <View
                className={`rounded-full px-4 py-2 ${
                  category === item.value
                    ? 'bg-primary-500'
                    : 'bg-background-50'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    category === item.value
                      ? 'text-white'
                      : 'text-typography-600'
                  }`}
                >
                  {item.label}
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
