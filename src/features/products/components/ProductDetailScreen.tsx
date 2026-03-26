import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { Box } from '../../../../components/ui/box';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useProductDetail } from '../hooks/useProductDetail';

export function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useProductDetail(id ?? null);

  function handleBack() {
    router.back();
  }

  function handleComparePrices() {
    logger.info('Products', 'Navigating to price comparison', id);
    router.push(`/products/prices?productId=${id}`);
  }

  function handleSubmitPrice() {
    logger.info('Products', 'Navigating to price submission', id);
    router.push(`/products/prices/submit?productId=${id}`);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Product Detail" onBack={handleBack} />
        <EmptyState
          title="Product Not Found"
          message="The product you are looking for does not exist."
          action={{ label: 'Go Back', onPress: handleBack }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title={product.name} onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Product image or placeholder */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="mb-3 h-48 w-full rounded-xl"
            resizeMode="cover"
            accessibilityLabel={`Image of ${product.name}`}
          />
        ) : (
          <Box
            className="mb-3 h-48 w-full items-center justify-center rounded-xl bg-background-100"
            accessibilityLabel="No image available"
          >
            <Text className="text-4xl">🛒</Text>
            <Text className="mt-2 text-sm text-typography-400">No image available</Text>
          </Box>
        )}

        {/* Product header card */}
        <Box className="rounded-xl bg-background-0 p-4 shadow-sm">
          <Text className="text-2xl font-bold text-typography-900">
            {product.name}
          </Text>
          <Text className="mt-1 text-base text-typography-500">{product.brand}</Text>

          <HStack className="mt-3 gap-2">
            <Text className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              {product.category}
            </Text>
            <Text className="rounded-full bg-background-100 px-3 py-1 text-sm text-typography-600">
              {product.unit}
            </Text>
          </HStack>
        </Box>

        {/* Price summary card */}
        <Box className="mt-3 rounded-xl bg-background-0 p-4 shadow-sm">
          <Text className="mb-3 text-lg font-semibold text-typography-900">
            Price Summary
          </Text>

          <HStack className="justify-between">
            <VStack>
              <Text className="text-xs text-typography-400">Lowest Price</Text>
              <Text className="mt-0.5 text-2xl font-bold text-success-600">
                {formatCurrency(product.lowestPrice)}
              </Text>
            </VStack>
            <VStack className="items-end">
              <Text className="text-xs text-typography-400">Average Price</Text>
              <Text className="mt-0.5 text-xl font-semibold text-typography-700">
                {formatCurrency(product.averagePrice)}
              </Text>
            </VStack>
          </HStack>

          <Text className="mt-3 text-sm text-typography-500">
            Based on {product.priceCount}{' '}
            {product.priceCount === 1 ? 'submission' : 'submissions'}
          </Text>
        </Box>

        {/* Product details card */}
        <Box className="mt-3 rounded-xl bg-background-0 p-4 shadow-sm">
          <Text className="mb-3 text-lg font-semibold text-typography-900">
            Details
          </Text>

          <VStack className="gap-2">
            <HStack className="justify-between">
              <Text className="text-sm text-typography-500">Barcode</Text>
              <Text className="font-mono text-sm text-typography-900">
                {product.barcode}
              </Text>
            </HStack>

            <View className="h-px bg-outline-100" />

            <HStack className="justify-between">
              <Text className="text-sm text-typography-500">Category</Text>
              <Text className="text-sm text-typography-900">{product.category}</Text>
            </HStack>

            <View className="h-px bg-outline-100" />

            <HStack className="justify-between">
              <Text className="text-sm text-typography-500">Unit</Text>
              <Text className="text-sm text-typography-900">{product.unit}</Text>
            </HStack>

            <View className="h-px bg-outline-100" />

            <HStack className="justify-between">
              <Text className="text-sm text-typography-500">Added</Text>
              <Text className="text-sm text-typography-900">
                {formatDate(product.createdAt)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Action buttons */}
        <VStack className="mt-4 gap-3">
          <TouchableOpacity
            className="items-center rounded-xl bg-primary-500 py-4"
            onPress={handleComparePrices}
            accessibilityRole="button"
            accessibilityLabel="Compare Prices"
          >
            <Text className="text-base font-semibold text-white">Compare Prices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center rounded-xl border border-primary-500 py-4"
            onPress={handleSubmitPrice}
            accessibilityRole="button"
            accessibilityLabel="Submit Price"
          >
            <Text className="text-base font-semibold text-primary-500">
              Submit Price
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
    </View>
  );
}
