import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { logger } from '@/shared/utils/logger';
import { useOptimize } from '../hooks/useOptimize';

export function OptimizeScreen() {
  const router = useRouter();
  const { listId } = useLocalSearchParams<{ listId: string }>();

  const { data: result, isLoading } = useOptimize(listId ?? null);

  function handleBack() {
    logger.info('Lists', 'Navigating back from optimize');
    router.back();
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Store Optimization" onBack={handleBack} />
        <LoadingSpinner />
      </View>
    );
  }

  if (!result || result.totalCost === 0) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Store Optimization" onBack={handleBack} />
        <EmptyState
          title="No Optimization Available"
          message="Add items to your list first to get store recommendations."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Store Optimization" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack className="gap-4">
          {/* Best store highlight */}
          <Box className="rounded-xl bg-primary-500 p-5 shadow-sm">
            <Text className="mb-1 text-sm font-medium text-primary-100">
              Best Store
            </Text>
            <Text className="text-2xl font-bold text-white">
              {result.bestStore.name}
            </Text>
            <Text className="mt-0.5 text-sm text-primary-200">
              {result.bestStore.city}, {result.bestStore.state}
            </Text>
            <HStack className="mt-4 justify-between">
              <VStack>
                <Text className="text-xs text-primary-200">Total Cost</Text>
                <Text className="mt-0.5 text-xl font-bold text-white">
                  {formatCurrency(result.totalCost)}
                </Text>
              </VStack>
              {result.savings > 0 ? (
                <VStack className="items-end">
                  <Text className="text-xs text-primary-200">You Save</Text>
                  <Text className="mt-0.5 text-xl font-bold text-success-300">
                    {formatCurrency(result.savings)}
                  </Text>
                </VStack>
              ) : null}
            </HStack>
          </Box>

          {/* Store breakdown */}
          <Text className="text-base font-semibold text-typography-700">
            All Stores Comparison
          </Text>

          <VStack className="gap-3">
            {result.storeBreakdown.map((breakdown, index) => (
              <Box
                key={breakdown.store.id}
                className={`rounded-xl p-4 shadow-sm ${
                  index === 0
                    ? 'border border-primary-200 bg-primary-50'
                    : 'bg-background-0'
                }`}
              >
                <HStack className="items-start justify-between">
                  <VStack className="flex-1">
                    <HStack className="items-center gap-2">
                      <Text className="text-base font-semibold text-typography-900">
                        {breakdown.store.name}
                      </Text>
                      {index === 0 ? (
                        <Box className="rounded-full bg-primary-500 px-2 py-0.5">
                          <Text className="text-xs font-medium text-white">
                            Best
                          </Text>
                        </Box>
                      ) : null}
                    </HStack>
                    <Text className="mt-0.5 text-xs text-typography-500">
                      {breakdown.itemsAvailable} available ·{' '}
                      {breakdown.itemsMissing} missing
                    </Text>
                  </VStack>
                  <Text
                    className={`text-lg font-bold ${
                      index === 0 ? 'text-primary-600' : 'text-typography-700'
                    }`}
                  >
                    {formatCurrency(breakdown.totalCost)}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}
