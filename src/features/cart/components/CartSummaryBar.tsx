import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';

interface CartSummaryBarProps {
  total: number;
  itemCount: number;
  onScan: () => void;
  onFinalize: () => void;
  isPending?: boolean;
}

/**
 * Barra fixa no terço inferior (zona do polegar): escanear é a ação mais
 * frequente durante a compra e por isso é o botão primário; finalizar fica ao lado.
 */
export function CartSummaryBar({ total, itemCount, onScan, onFinalize, isPending }: CartSummaryBarProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const canFinalize = itemCount > 0 && !isPending;

  return (
    <View
      className="bg-background-0 px-5 pt-3"
      style={{
        paddingBottom: Math.max(insets.bottom, 12) + 4,
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
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-[1.4] flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
          onPress={onScan}
          accessibilityRole="button"
          accessibilityLabel="Escanear produto"
          activeOpacity={0.8}
        >
          <Ionicons name="barcode-outline" size={20} color={colors.white} />
          <Text className="text-sm font-bold text-white">Escanear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-full border-2 py-4 ${
            canFinalize ? 'border-success-500 bg-success-50' : 'border-outline-200'
          }`}
          onPress={onFinalize}
          disabled={!canFinalize}
          accessibilityRole="button"
          accessibilityLabel="Finalizar compra"
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={canFinalize ? colors.success : colors.textMuted}
          />
          <Text
            className={`text-sm font-bold ${canFinalize ? 'text-success-700' : 'text-typography-400'}`}
          >
            {isPending ? 'Finalizando...' : 'Finalizar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
