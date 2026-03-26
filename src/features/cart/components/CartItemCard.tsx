import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { PurchaseItem } from '../types';

interface CartItemCardProps {
  item: PurchaseItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const colors = useThemeColors();

  return (
    <View className="mb-2.5 rounded-2xl bg-background-0 p-4">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-sm font-bold text-typography-900" numberOfLines={2}>
            {item.productName}
          </Text>
          <Text className="mt-0.5 text-xs text-typography-400">
            {formatCurrency(item.price)} / un
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.productName}`}
          className="h-8 w-8 items-center justify-center rounded-full bg-error-50"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={14} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
            accessibilityRole="button"
            accessibilityLabel="Diminuir quantidade"
            className="h-8 w-8 items-center justify-center rounded-full bg-background-100"
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={16} color={colors.icon} />
          </TouchableOpacity>
          <Text className="min-w-[24px] text-center text-base font-bold text-typography-900">
            {item.quantity}
          </Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            accessibilityRole="button"
            accessibilityLabel="Aumentar quantidade"
            className="h-8 w-8 items-center justify-center rounded-full bg-primary-50"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text className="text-base font-bold text-primary-500">
          {formatCurrency(item.price * item.quantity)}
        </Text>
      </View>
    </View>
  );
}
