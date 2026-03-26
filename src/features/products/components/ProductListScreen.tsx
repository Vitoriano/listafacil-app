import React, { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity } from 'react-native';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { Box } from '../../../../components/ui/box';
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
  { label: 'All', value: undefined },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Meat', value: 'meat' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Beverages', value: 'beverages' },
  { label: 'Grains', value: 'grains' },
  { label: 'Snacks', value: 'snacks' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Hygiene', value: 'hygiene' },
  { label: 'Other', value: 'other' },
];

const SORT_OPTIONS: { label: string; value: 'name' | 'price' | 'recent' }[] = [
  { label: 'Name', value: 'name' },
  { label: 'Price', value: 'price' },
  { label: 'Recent', value: 'recent' },
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

  if (isLoading && page === 1) {
    return <LoadingSpinner />;
  }

  return (
    <VStack className="flex-1 bg-background-50">
      {/* Header */}
      <Box className="bg-background-0 px-4 pb-3 pt-4 shadow-sm">
        <Text className="mb-3 text-2xl font-bold text-typography-900">Products</Text>

        {/* Search input */}
        <TextInput
          className="rounded-lg border border-outline-200 bg-background-50 px-3 py-2 text-base text-typography-900"
          placeholder="Search by name or brand..."
          placeholderTextColor="#9CA3AF"
          value={inputValue}
          onChangeText={handleSearchChange}
          accessibilityLabel="Search products"
          returnKeyType="search"
        />

        {/* Sort controls */}
        <HStack className="mt-3 gap-2">
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSortSelect(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={`Sort by ${opt.label}`}
            >
              <Box
                className={`rounded-lg px-3 py-1.5 ${
                  sortBy === opt.value
                    ? 'bg-primary-500'
                    : 'bg-background-100 border border-outline-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    sortBy === opt.value ? 'text-white' : 'text-typography-700'
                  }`}
                >
                  {opt.label}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      {/* Category filter */}
      <Box className="bg-background-0 pb-3">
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.value ?? 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.value)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Box
                className={`rounded-full px-3 py-1.5 ${
                  category === item.value
                    ? 'bg-primary-500'
                    : 'bg-background-100 border border-outline-200'
                }`}
              >
                <Text
                  className={`text-sm ${
                    category === item.value
                      ? 'font-semibold text-white'
                      : 'text-typography-600'
                  }`}
                >
                  {item.label}
                </Text>
              </Box>
            </TouchableOpacity>
          )}
        />
      </Box>

      {/* Product list */}
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
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
            title="No products found"
            message="Try adjusting your search or filter."
          />
        }
        ListFooterComponent={
          isLoading && page > 1 ? <LoadingSpinner size="small" /> : null
        }
      />
    </VStack>
  );
}
