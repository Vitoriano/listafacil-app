import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
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
        title={comparison?.productName ?? 'Price Comparison'}
        subtitle="Compare prices across stores"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Summary header */}
        {comparison && comparison.entries.length > 0 ? (
          <Box className="mb-4 rounded-xl bg-background-0 p-4 shadow-sm">
            <Text className="mb-3 text-lg font-semibold text-typography-900">
              Price Summary
            </Text>
            <HStack className="justify-between">
              <VStack>
                <Text className="text-xs text-typography-400">Lowest</Text>
                <Text className="mt-0.5 text-xl font-bold text-success-600">
                  {formatCurrency(comparison.lowestPrice)}
                </Text>
              </VStack>
              <VStack className="items-center">
                <Text className="text-xs text-typography-400">Average</Text>
                <Text className="mt-0.5 text-lg font-semibold text-typography-700">
                  {formatCurrency(comparison.averagePrice)}
                </Text>
              </VStack>
              <VStack className="items-end">
                <Text className="text-xs text-typography-400">Highest</Text>
                <Text className="mt-0.5 text-lg font-semibold text-error-600">
                  {formatCurrency(comparison.highestPrice)}
                </Text>
              </VStack>
            </HStack>
            <Text className="mt-3 text-sm text-typography-500">
              {comparison.storeCount}{' '}
              {comparison.storeCount === 1 ? 'store' : 'stores'} reporting prices
            </Text>
          </Box>
        ) : null}

        {/* Price entries list */}
        {!comparison || comparison.entries.length === 0 ? (
          <EmptyState
            title="No Prices Found"
            message="No price submissions found for this product. Be the first to submit!"
            action={{ label: 'Submit Price', onPress: handleSubmitPrice }}
          />
        ) : (
          <VStack className="gap-3">
            {comparison.entries.map((entry) => (
              <Box
                key={entry.id}
                className="rounded-xl bg-background-0 p-4 shadow-sm"
              >
                <HStack className="items-start justify-between">
                  <VStack className="flex-1">
                    <Text className="text-base font-semibold text-typography-900">
                      {entry.storeName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400">
                      {formatDate(entry.submittedAt)}
                    </Text>
                    <Text className="mt-1 text-xs text-typography-500">
                      {entry.validations}{' '}
                      {entry.validations === 1 ? 'validation' : 'validations'}
                    </Text>
                  </VStack>
                  <VStack className="items-end">
                    <Text className="text-2xl font-bold text-primary-600">
                      {formatCurrency(entry.price)}
                    </Text>
                    <HStack className="mt-2 gap-2">
                      <TouchableOpacity
                        onPress={() => handleValidate(entry, true)}
                        disabled={validatingId === entry.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Validate price as correct for ${entry.storeName}`}
                        className="rounded-lg bg-success-100 px-3 py-1.5"
                      >
                        <Text className="text-base">👍</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleValidate(entry, false)}
                        disabled={validatingId === entry.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Validate price as incorrect for ${entry.storeName}`}
                        className="rounded-lg bg-error-100 px-3 py-1.5"
                      >
                        <Text className="text-base">👎</Text>
                      </TouchableOpacity>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* Action buttons */}
        {comparison && comparison.entries.length > 0 ? (
          <VStack className="mt-4 gap-3">
            <TouchableOpacity
              className="items-center rounded-xl bg-primary-500 py-4"
              onPress={handleSubmitPrice}
              accessibilityRole="button"
              accessibilityLabel="Submit Price"
            >
              <Text className="text-base font-semibold text-white">
                Submit Price
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-xl border border-primary-500 py-4"
              onPress={handleViewHistory}
              accessibilityRole="button"
              accessibilityLabel="View History"
            >
              <Text className="text-base font-semibold text-primary-500">
                View History
              </Text>
            </TouchableOpacity>
          </VStack>
        ) : null}
      </ScrollView>
    </View>
  );
}
