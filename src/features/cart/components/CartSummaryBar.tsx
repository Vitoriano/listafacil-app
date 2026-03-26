import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface CartSummaryBarProps {
  total: number;
  itemCount: number;
  onFinalize: () => void;
  isPending?: boolean;
}

export function CartSummaryBar({ total, itemCount, onFinalize, isPending }: CartSummaryBarProps) {
  const colors = useThemeColors();
  const bottomPadding = Platform.OS === 'ios' ? 34 : 16;

  return (
    <View
      className="bg-background-0 px-5 pt-4"
      style={{
        paddingBottom: bottomPadding,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm text-typography-500">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </Text>
        <Text className="text-xl font-bold text-typography-900">
          {formatCurrency(total)}
        </Text>
      </View>
      <TouchableOpacity
        className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
          isPending || itemCount === 0 ? 'bg-primary-300' : 'bg-primary-500'
        }`}
        onPress={onFinalize}
        disabled={isPending || itemCount === 0}
        accessibilityRole="button"
        accessibilityLabel="Finalizar compra"
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={20} color={colors.white} />
        <Text className="text-sm font-bold text-white">
          {isPending ? 'Finalizando...' : 'Finalizar Compra'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
