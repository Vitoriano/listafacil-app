import React from 'react';
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
import { usePriceHistory } from '../hooks/usePriceHistory';

export function PriceHistoryScreen() {
  const router = useRouter();
  const { productId, storeId } = useLocalSearchParams<{
    productId: string;
    storeId?: string;
  }>();

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

  const subtitle = storeId ? 'Filtered by store' : 'All stores';

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader
        title="Price History"
        subtitle={subtitle}
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!history || history.length === 0 ? (
          <EmptyState
            title="No History Found"
            message="No price history found for this product."
            action={{ label: 'Go Back', onPress: handleBack }}
          />
        ) : (
          <VStack className="gap-3">
            {history.map((point, index) => (
              <Box
                key={`${point.storeId}-${point.date}-${index}`}
                className="rounded-xl bg-background-0 p-4 shadow-sm"
              >
                <HStack className="items-center justify-between">
                  <VStack className="flex-1">
                    <Text className="text-base font-semibold text-typography-900">
                      {point.storeName}
                    </Text>
                    <Text className="mt-0.5 text-sm text-typography-400">
                      {formatDate(point.date)}
                    </Text>
                  </VStack>
                  <Text className="text-xl font-bold text-primary-600">
                    {formatCurrency(point.price)}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        <TouchableOpacity
          className="mt-4 items-center rounded-xl border border-primary-500 py-4"
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go Back"
        >
          <Text className="text-base font-semibold text-primary-500">
            Go Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
