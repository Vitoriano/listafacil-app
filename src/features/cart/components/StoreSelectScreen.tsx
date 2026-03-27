import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { logger } from '@/shared/utils/logger';
import { useStores } from '../hooks/useStores';
import { useCartStore } from '../stores/cartStore';
import type { Store } from '@/shared/types';

const STORE_TYPE_LABELS: Record<string, string> = {
  supermarket: 'Supermercado',
  hypermarket: 'Hipermercado',
  convenience: 'Conveniencia',
  wholesale: 'Atacado',
};

export function StoreSelectScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: stores, isLoading } = useStores();
  const startSession = useCartStore((s) => s.startSession);
  const isStarting = useCartStore((s) => s.isStarting);

  function handleBack() {
    router.back();
  }

  async function handleSelectStore(store: Store) {
    logger.info('Cart', 'Store selected', store.id);
    try {
      await startSession(store.id, store.name);
      router.replace('/cart');
    } catch (error) {
      logger.error('Cart', 'Failed to start session', error);
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Escolher Supermercado" onBack={handleBack} />

      <View className="px-5 py-3">
        <Text className="text-sm text-typography-500">
          Onde voce esta fazendo compras?
        </Text>
      </View>

      <FlatList
        data={stores ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectStore(item)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${item.name}`}
            className="mb-2.5"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3 rounded-2xl bg-background-0 p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Ionicons name="storefront-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-typography-900">{item.name}</Text>
                <Text className="mt-0.5 text-xs text-typography-500">
                  {item.address}
                </Text>
                <Text className="text-xs text-typography-400">
                  {item.city}, {item.state}
                </Text>
              </View>
              <View className="rounded-full bg-background-50 px-2.5 py-1">
                <Text className="text-xs text-typography-500">
                  {STORE_TYPE_LABELS[item.type] ?? item.type}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
