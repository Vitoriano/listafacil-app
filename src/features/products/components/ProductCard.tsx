import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useProductImageUri } from '@/shared/hooks/useProductImageUri';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useCategoryName } from '@/features/products/hooks/useCategoryName';
import type { Product } from '@/features/products/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard = React.memo(function ProductCard({ product, onPress }: ProductCardProps) {
  const colors = useThemeColors();
  const { uri: thumbUri } = useProductImageUri(product);
  const categoryName = useCategoryName(product);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Produto ${product.name}`}
      activeOpacity={0.7}
    >
      <View className="mb-3 rounded-2xl bg-background-0 p-4">
        <View className="flex-row items-start justify-between">
          {thumbUri ? (
            <Image
              source={{ uri: thumbUri }}
              className="mr-3 h-16 w-16 rounded-xl bg-background-100"
              resizeMode="cover"
              accessibilityLabel={`Miniatura de ${product.name}`}
            />
          ) : (
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-xl bg-background-100">
              <Ionicons name="image-outline" size={22} color={colors.textMuted} />
            </View>
          )}
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
            <View className="mt-2.5 flex-row flex-wrap gap-2">
              <View className="shrink rounded-full bg-primary-50 px-2.5 py-1">
                <Text className="text-xs font-semibold text-primary-600" numberOfLines={1}>
                  {categoryName}
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
            {product.latestPrice ? (
              <>
                <Text className="text-lg font-bold text-success-600">
                  {formatCurrency(product.latestPrice.price)}
                </Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <Ionicons name="storefront-outline" size={11} color={colors.textTertiary} />
                  <Text className="text-xs text-typography-400" numberOfLines={1}>
                    {product.latestPrice.store.name}
                  </Text>
                </View>
              </>
            ) : (
              <Text className="text-sm text-typography-400">Sem preco</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
