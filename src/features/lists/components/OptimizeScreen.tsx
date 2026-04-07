import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { useOptimize } from '../hooks/useOptimize';

export function OptimizeScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams<{ listId: string }>();

  const colors = useThemeColors();
  const { data: result, isLoading } = useOptimize(listId ?? null);

  function handleBack() {
    logger.info('Lists', 'Navigating back from optimize');
    router.back();
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Otimização" onBack={handleBack} />
        <LoadingSpinner />
      </View>
    );
  }

  if (!result || !result.bestStore || !result.stores?.length) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Otimização" onBack={handleBack} />
        <EmptyState
          title="Sem Otimização"
          message="Adicione itens à sua lista para receber recomendações de onde comprar mais barato."
          icon="flash-outline"
        />
      </View>
    );
  }

  const { bestStore, stores } = result;

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Otimização" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="gap-4">
          {/* Best store highlight */}
          <View className="rounded-2xl bg-primary-500 p-5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="trophy" size={18} color="rgba(255,255,255,0.8)" />
              <Text className="text-xs font-semibold text-white opacity-80">
                Melhor Loja
              </Text>
            </View>
            <Text className="mt-1 text-2xl font-bold text-white">
              {bestStore.storeName}
            </Text>
            <View className="mt-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-white opacity-70">Custo Total</Text>
                <Text className="mt-0.5 text-xl font-bold text-white">
                  {formatCurrency(bestStore.totalCost)}
                </Text>
              </View>
              {bestStore.savings > 0 ? (
                <View className="items-end">
                  <Text className="text-xs text-white opacity-70">Você Economiza</Text>
                  <View className="mt-0.5 flex-row items-center gap-1">
                    <Ionicons name="trending-down" size={16} color={colors.success} />
                    <Text className="text-xl font-bold text-success-200">
                      {formatCurrency(bestStore.savings)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* Store breakdown */}
          <Text className="text-sm font-bold text-typography-700">
            Comparação entre Lojas
          </Text>

          <View className="gap-3">
            {stores.map((store, index) => (
              <View
                key={store.storeId}
                className={`rounded-2xl p-4 ${
                  index === 0
                    ? 'border-2 border-primary-200 bg-primary-50'
                    : 'bg-background-0'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-typography-900">
                        {store.storeName}
                      </Text>
                      {index === 0 ? (
                        <View className="flex-row items-center gap-1 rounded-full bg-primary-500 px-2.5 py-0.5">
                          <Ionicons name="star" size={10} color={colors.white} />
                          <Text className="text-xs font-bold text-white">
                            Melhor
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text className="text-xs text-typography-500">
                        {store.itemsAvailable} disponíveis
                      </Text>
                      {store.itemsMissing > 0 ? (
                        <>
                          <Text className="text-xs text-typography-400"> · </Text>
                          <Text className="text-xs text-error-500">
                            {store.itemsMissing} indisponíveis
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                  <Text
                    className={`text-lg font-bold ${
                      index === 0 ? 'text-primary-500' : 'text-typography-700'
                    }`}
                  >
                    {formatCurrency(store.totalCost)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
