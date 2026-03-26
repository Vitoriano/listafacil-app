import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { usePriceHistory } from '../hooks/usePriceHistory';

export function PriceHistoryScreen() {
  const router = useRouter();
  const { productId, storeId } = useLocalSearchParams<{
    productId: string;
    storeId?: string;
  }>();

  const colors = useThemeColors();
  const { data: history, isLoading } = usePriceHistory(
    productId ?? null,
    storeId ?? undefined,
  );

  function handleBack() {
    logger.info('Prices', 'Navigating back from price history');
    router.back();
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const subtitle = storeId ? 'Filtrado por loja' : 'Todas as lojas';

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title="Historico de Precos"
        subtitle={subtitle}
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!history || history.length === 0 ? (
          <EmptyState
            title="Sem Historico"
            message="Nenhum historico de precos encontrado para este produto."
            icon="time-outline"
            action={{ label: 'Voltar', onPress: handleBack }}
          />
        ) : (
          <View className="gap-3">
            {history.map((point, index) => (
              <View
                key={`${point.storeId}-${point.date}-${index}`}
                className="rounded-2xl bg-background-0 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-typography-900">
                      {point.storeName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400">
                      {formatDate(point.date)}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-primary-500">
                    {formatCurrency(point.price)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          className="mt-4 flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-4"
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text className="text-sm font-bold text-primary-500">
            Voltar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
