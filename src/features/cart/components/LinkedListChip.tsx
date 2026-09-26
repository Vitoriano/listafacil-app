import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

/** Lembrete de contexto nas telas de escolha de loja: "comprando a lista X". */
export function LinkedListChip({ listName }: { listName: string }) {
  const colors = useThemeColors();
  return (
    <View className="mx-5 mb-1 mt-3 flex-row items-center gap-2 rounded-2xl bg-primary-50 px-4 py-3">
      <Ionicons name="list" size={16} color={colors.primary} />
      <Text className="flex-1 text-xs text-typography-700" numberOfLines={1}>
        Comprando a lista{' '}
        <Text className="font-bold text-typography-900">{listName}</Text>
      </Text>
    </View>
  );
}
