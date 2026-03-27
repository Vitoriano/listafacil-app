import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

export function StoreListScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const { data: allStores, isLoading } = useStores();
  const startSession = useCartStore((s) => s.startSession);
  const isStarting = useCartStore((s) => s.isStarting);

  const stores = allStores?.filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  async function handleSelectStore(store: Store) {
    logger.info('Cart', 'Store selected from list', store.id);
    try {
      await startSession(store.id, store.name);
      router.replace('/cart');
    } catch (error) {
      logger.error('Cart', 'Failed to start session', error);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Buscar Supermercado" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-sm text-typography-500">
            Carregando supermercados...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Buscar Supermercado" onBack={() => router.back()} />

      <View className="px-5 py-3">
        <View className="flex-row items-center gap-2.5 rounded-xl bg-background-0 px-3.5">
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            className="flex-1 py-3 text-sm text-typography-900"
            placeholder="Buscar por nome, endereco ou cidade..."
            placeholderTextColor={colors.textQuaternary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={stores ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="storefront-outline" size={28} color={colors.textTertiary} />
            <Text className="mt-3 text-sm text-typography-500">
              Nenhum supermercado encontrado.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectStore(item)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${item.name}`}
            className="mb-2.5"
            activeOpacity={0.7}
            disabled={isStarting}
          >
            <View className="flex-row items-center gap-3 rounded-2xl bg-background-0 p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Ionicons name="storefront-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-typography-900">{item.name}</Text>
                <Text className="mt-0.5 text-xs text-typography-500">{item.address}</Text>
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
