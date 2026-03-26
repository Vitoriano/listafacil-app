import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '../../../../components/ui/box';
import { VStack } from '../../../../components/ui/vstack';
import { HStack } from '../../../../components/ui/hstack';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useSavings } from '../hooks/useSavings';
import type { MonthlySaving, RecentPurchase } from '@/features/auth/types';

export function SavingsScreen() {
  const router = useRouter();
  const { data: savings, isLoading } = useSavings();

  function handleBack() {
    logger.info('Profile', 'Navigating back from savings');
    router.back();
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const monthlySavings = savings?.monthlySavings ?? [];
  const recentPurchases = savings?.recentPurchases ?? [];
  const hasData = monthlySavings.length > 0 || recentPurchases.length > 0;

  return (
    <VStack className="flex-1 bg-background-50">
      <AppHeader title="Savings" onBack={handleBack} />

      {!hasData ? (
        <EmptyState
          title="No Savings Yet"
          message="Start submitting prices to track your savings."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* Total savings */}
          <Box className="mb-3 rounded-xl bg-primary-500 p-4 shadow-sm">
            <Text className="text-sm font-medium text-white opacity-80">
              Total Savings
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {formatCurrency(savings?.totalSavings ?? 0)}
            </Text>
          </Box>

          {/* Monthly savings */}
          {monthlySavings.length > 0 ? (
            <Box className="mb-3 rounded-xl bg-background-0 p-4 shadow-sm">
              <Text className="mb-3 text-base font-semibold text-typography-900">
                Monthly Savings
              </Text>
              <VStack className="gap-2">
                {monthlySavings.map((item: MonthlySaving) => (
                  <HStack
                    key={item.month}
                    className="items-center justify-between"
                    accessibilityLabel={`${item.month}: ${formatCurrency(item.amount)}`}
                  >
                    <Text className="text-sm text-typography-600">
                      {item.month}
                    </Text>
                    <Text className="text-sm font-semibold text-primary-600">
                      {formatCurrency(item.amount)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          ) : null}

          {/* Recent purchases */}
          {recentPurchases.length > 0 ? (
            <VStack className="gap-3">
              <Text className="text-base font-semibold text-typography-900">
                Recent Purchases
              </Text>
              {recentPurchases.map((item: RecentPurchase, index: number) => (
                <Box
                  key={`${item.listName}-${index}`}
                  className="rounded-xl bg-background-0 p-4 shadow-sm"
                  accessibilityLabel={`Purchase at ${item.storeName} on ${formatDate(item.date)}`}
                >
                  <HStack className="items-start justify-between">
                    <VStack className="flex-1 gap-0.5">
                      <Text className="text-base font-semibold text-typography-900">
                        {item.listName}
                      </Text>
                      <Text className="text-sm text-typography-500">
                        {item.storeName}
                      </Text>
                      <Text className="text-xs text-typography-400">
                        {formatDate(item.date)}
                      </Text>
                    </VStack>
                    <VStack className="items-end gap-0.5">
                      <Text className="text-base font-bold text-typography-900">
                        {formatCurrency(item.total)}
                      </Text>
                      <Text className="text-sm font-medium text-primary-600">
                        -{formatCurrency(item.savings)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : null}
        </ScrollView>
      )}
    </VStack>
  );
}
