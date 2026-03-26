import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { logger } from '@/shared/utils/logger';
import { useSavings } from '../hooks/useSavings';
import type { MonthlySaving, RecentPurchase } from '@/features/auth/types';

export function SavingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
    <View className="flex-1 bg-background-50">
      <AppHeader title="Economia" onBack={handleBack} />

      {!hasData ? (
        <EmptyState
          title="Sem Economia"
          message="Comece a enviar precos para acompanhar sua economia."
          icon="trending-up"
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* Total savings */}
          <View className="mb-1 rounded-2xl bg-primary-500 p-5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text className="text-xs font-semibold text-white opacity-80">
                Economia Total
              </Text>
            </View>
            <Text className="mt-2 text-3xl font-bold text-white">
              {formatCurrency(savings?.totalSavings ?? 0)}
            </Text>
          </View>

          {/* Monthly savings */}
          {monthlySavings.length > 0 ? (
            <View className="mb-1 rounded-2xl bg-background-0 p-4">
              <Text className="mb-3 text-sm font-bold text-typography-900">
                Economia Mensal
              </Text>
              <View className="gap-3">
                {monthlySavings.map((item: MonthlySaving) => (
                  <View
                    key={item.month}
                    className="flex-row items-center justify-between"
                    accessibilityLabel={`${item.month}: ${formatCurrency(item.amount)}`}
                  >
                    <Text className="text-sm text-typography-600">
                      {item.month}
                    </Text>
                    <Text className="text-sm font-bold text-success-600">
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Recent purchases */}
          {recentPurchases.length > 0 ? (
            <View className="gap-3">
              <Text className="text-sm font-bold text-typography-900">
                Compras Recentes
              </Text>
              {recentPurchases.map((item: RecentPurchase, index: number) => (
                <View
                  key={`${item.listName}-${index}`}
                  className="rounded-2xl bg-background-0 p-4"
                  accessibilityLabel={`Compra em ${item.storeName} em ${formatDate(item.date)}`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 gap-0.5">
                      <Text className="text-sm font-bold text-typography-900">
                        {item.listName}
                      </Text>
                      <Text className="text-xs text-typography-500">
                        {item.storeName}
                      </Text>
                      <Text className="text-xs text-typography-400">
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <View className="items-end gap-0.5">
                      <Text className="text-sm font-bold text-typography-900">
                        {formatCurrency(item.total)}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="trending-down" size={12} color={colors.success} />
                        <Text className="text-xs font-bold text-success-600">
                          -{formatCurrency(item.savings)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
