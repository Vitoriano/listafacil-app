import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface ActiveCartBannerProps {
  storeName: string;
  addedCount: number;
  totalCount: number;
  onGoToCart: () => void;
}

export function ActiveCartBanner({
  storeName,
  addedCount,
  totalCount,
  onGoToCart,
}: ActiveCartBannerProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onGoToCart}
      activeOpacity={0.7}
      className="mx-4 mb-3 mt-2"
    >
      <View className="flex-row items-center gap-3 rounded-2xl bg-success-50 p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-success-100">
          <Ionicons name="cart" size={18} color={colors.success} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-typography-900">
            Comprando em {storeName}
          </Text>
          <Text className="mt-0.5 text-xs text-success-600">
            {addedCount}/{totalCount} itens no carrinho
          </Text>
        </View>
        <View className="flex-row items-center gap-1 rounded-full bg-success-500 px-3 py-1.5">
          <Text className="text-xs font-bold text-white">Ir ao Carrinho</Text>
          <Ionicons name="chevron-forward" size={12} color={colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
