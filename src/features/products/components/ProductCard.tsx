import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { HStack } from '../../../../components/ui/hstack';
import { VStack } from '../../../../components/ui/vstack';
import { Box } from '../../../../components/ui/box';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { Product } from '@/features/products/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Product ${product.name}`}
    >
      <Box className="mb-2 rounded-xl bg-background-0 p-4 shadow-sm">
        <HStack className="items-start justify-between">
          <VStack className="flex-1 mr-3">
            <Text
              className="text-base font-semibold text-typography-900"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <Text className="mt-1 text-sm text-typography-500">
              {product.brand}
            </Text>
            <HStack className="mt-2 gap-2">
              <Text className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {product.category}
              </Text>
              <Text className="rounded-full bg-background-100 px-2 py-0.5 text-xs text-typography-600">
                {product.unit}
              </Text>
            </HStack>
          </VStack>
          <VStack className="items-end">
            <Text className="text-lg font-bold text-success-600">
              {formatCurrency(product.lowestPrice)}
            </Text>
            <Text className="mt-1 text-xs text-typography-400">
              {product.priceCount} {product.priceCount === 1 ? 'price' : 'prices'}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
}
