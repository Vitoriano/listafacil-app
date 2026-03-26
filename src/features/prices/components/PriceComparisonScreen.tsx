import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { usePriceComparison } from '../hooks/usePriceComparison';
import { priceRepository } from '@/data/repositories';
import type { PriceEntry } from '../types';

export function PriceComparisonScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const { data: comparison, isLoading, refetch } = usePriceComparison(productId ?? null);

  function handleBack() {
    router.back();
  }

  function handleSubmitPrice() {
    logger.info('Prices', 'Navigating to price submission', productId);
    router.push(`/products/prices/submit?productId=${productId}`);
  }

  function handleViewHistory() {
    logger.info('Prices', 'Navigating to price history', productId);
    router.push(`/products/prices/history?productId=${productId}`);
  }

  async function handleValidate(entry: PriceEntry, isValid: boolean) {
    logger.info('Prices', 'Validating price entry', entry.id, isValid);
    setValidatingId(entry.id);
    try {
      await priceRepository.validate(entry.id, isValid);
      await refetch();
    } finally {
      setValidatingId(null);
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title={comparison?.productName ?? 'Comparar Precos'}
        subtitle="Compare precos entre lojas"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Summary header */}
        {comparison && comparison.entries.length > 0 ? (
          <View className="mb-4 rounded-2xl bg-background-0 p-4">
            <Text className="mb-3 text-base font-bold text-typography-900">
              Resumo de Precos
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-typography-400">Menor</Text>
                <Text className="mt-0.5 text-xl font-bold text-success-600">
                  {formatCurrency(comparison.lowestPrice)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-typography-400">Medio</Text>
                <Text className="mt-0.5 text-lg font-semibold text-typography-700">
                  {formatCurrency(comparison.averagePrice)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-typography-400">Maior</Text>
                <Text className="mt-0.5 text-lg font-semibold text-error-500">
                  {formatCurrency(comparison.highestPrice)}
                </Text>
              </View>
            </View>
            <View className="mt-3 flex-row items-center gap-1">
              <Ionicons name="storefront-outline" size={14} color="#7D7D7D" />
              <Text className="text-xs text-typography-500">
                {comparison.storeCount}{' '}
                {comparison.storeCount === 1 ? 'loja' : 'lojas'} reportando precos
              </Text>
            </View>
          </View>
        ) : null}

        {/* Price entries list */}
        {!comparison || comparison.entries.length === 0 ? (
          <EmptyState
            title="Nenhum Preco"
            message="Nenhum preco encontrado. Seja o primeiro a enviar!"
            icon="pricetag-outline"
            action={{ label: 'Enviar Preco', onPress: handleSubmitPrice }}
          />
        ) : (
          <View className="gap-3">
            {comparison.entries.map((entry) => (
              <View
                key={entry.id}
                className="rounded-2xl bg-background-0 p-4"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-typography-900">
                      {entry.storeName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400">
                      {formatDate(entry.submittedAt)}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <Ionicons name="checkmark-circle-outline" size={12} color="#7D7D7D" />
                      <Text className="text-xs text-typography-500">
                        {entry.validations}{' '}
                        {entry.validations === 1 ? 'validacao' : 'validacoes'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-primary-500">
                      {formatCurrency(entry.price)}
                    </Text>
                    <View className="mt-2 flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleValidate(entry, true)}
                        disabled={validatingId === entry.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Validar preco como correto em ${entry.storeName}`}
                        className="h-9 w-9 items-center justify-center rounded-full bg-success-50"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="thumbs-up-outline" size={16} color="#05966A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleValidate(entry, false)}
                        disabled={validatingId === entry.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Validar preco como incorreto em ${entry.storeName}`}
                        className="h-9 w-9 items-center justify-center rounded-full bg-error-50"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="thumbs-down-outline" size={16} color="#C41C1C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        {comparison && comparison.entries.length > 0 ? (
          <View className="mt-4 gap-3">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
              onPress={handleSubmitPrice}
              accessibilityRole="button"
              accessibilityLabel="Enviar Preco"
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text className="text-sm font-bold text-white">
                Enviar Preco
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-full border-2 border-primary-500 py-4"
              onPress={handleViewHistory}
              accessibilityRole="button"
              accessibilityLabel="Ver Historico"
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color="#EA1D2C" />
              <Text className="text-sm font-bold text-primary-500">
                Ver Historico
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
