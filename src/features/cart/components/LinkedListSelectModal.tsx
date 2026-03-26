import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useLists } from '@/features/lists/hooks/useLists';
import type { ShoppingList } from '@/features/lists/types';

interface LinkedListSelectModalProps {
  visible: boolean;
  onSelect: (list: ShoppingList) => void;
  onClose: () => void;
}

export function LinkedListSelectModal({ visible, onSelect, onClose }: LinkedListSelectModalProps) {
  const colors = useThemeColors();
  const { data: lists, isLoading } = useLists();

  const nonEmptyLists = (lists ?? []).filter((l) => l.itemCount > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background-50">
        <AppHeader title="Vincular Lista" onBack={onClose} />

        <View className="px-5 py-3">
          <Text className="text-sm text-typography-500">
            Escolha uma lista para acompanhar durante a compra
          </Text>
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={nonEmptyLists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, flexGrow: 1 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`Vincular lista ${item.name}`}
                className="mb-2.5"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3 rounded-2xl bg-background-0 p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                    <Ionicons name="list" size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-typography-900">
                      {item.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-500">
                      {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'} ·{' '}
                      {item.items.filter((i) => i.checked).length} marcados
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-8 py-16">
                <Ionicons name="list-outline" size={40} color={colors.textMuted} />
                <Text className="mt-3 text-center text-sm text-typography-500">
                  Nenhuma lista com itens disponivel
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}
