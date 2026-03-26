import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface LinkedListBannerProps {
  listName: string;
  addedCount: number;
  totalCount: number;
  onViewList: () => void;
  onUnlink: () => void;
}

export function LinkedListBanner({
  listName,
  addedCount,
  totalCount,
  onViewList,
  onUnlink,
}: LinkedListBannerProps) {
  const colors = useThemeColors();
  const progress = totalCount > 0 ? addedCount / totalCount : 0;
  const isComplete = addedCount >= totalCount && totalCount > 0;

  return (
    <View className="mx-5 mb-3 rounded-2xl bg-primary-50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-100">
            <Ionicons
              name={isComplete ? 'checkmark-circle' : 'list'}
              size={18}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-typography-900" numberOfLines={1}>
              {listName}
            </Text>
            <Text className="mt-0.5 text-xs text-typography-500">
              {addedCount} de {totalCount} itens adicionados
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onViewList}
            className="rounded-full bg-primary-500 px-3 py-1.5"
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold text-white">Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onUnlink}
            className="h-7 w-7 items-center justify-center rounded-full bg-primary-100"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-100">
        <View
          className={`h-full rounded-full ${isComplete ? 'bg-success-500' : 'bg-primary-500'}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>
    </View>
  );
}
