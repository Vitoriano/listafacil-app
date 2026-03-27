import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { Product } from '@/features/products/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Produto ${product.name}`}
      activeOpacity={0.7}
    >
      <View className="mb-3 rounded-2xl bg-background-0 p-4">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text
              className="text-base font-bold text-typography-900"
              numberOfLines={2}
            >
              {product.name}
            </Text>
            <Text className="mt-0.5 text-xs text-typography-500">
              {product.brand}
            </Text>
            <View className="mt-2.5 flex-row gap-2">
              <View className="rounded-full bg-primary-50 px-2.5 py-1">
                <Text className="text-xs font-semibold text-primary-600">
                  {product.categoryId ?? '—'}
                </Text>
              </View>
              <View className="rounded-full bg-background-100 px-2.5 py-1">
                <Text className="text-xs text-typography-500">
                  {product.unit}
                </Text>
              </View>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-success-600">
              {formatCurrency(product.lowestPrice)}
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="pricetag-outline" size={11} color={colors.textTertiary} />
              <Text className="text-xs text-typography-400">
                {product.priceCount} {product.priceCount === 1 ? 'preco' : 'precos'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
