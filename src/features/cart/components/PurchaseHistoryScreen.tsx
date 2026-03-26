import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { usePurchases } from '../hooks/usePurchases';
import type { Purchase } from '../types';

export function PurchaseHistoryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: purchases, isLoading } = usePurchases();

  function handleBack() {
    router.back();
  }

  function handlePurchasePress(purchase: Purchase) {
    router.push(`/cart/${purchase.id}`);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Historico de Compras" onBack={handleBack} />

      <FlatList
        data={purchases ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePurchasePress(item)}
            accessibilityRole="button"
            accessibilityLabel={`Compra em ${item.storeName}`}
            className="mb-2.5"
            activeOpacity={0.7}
          >
            <View className="rounded-2xl bg-background-0 p-4">
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                    <Ionicons name="bag-check-outline" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-typography-900">
                      {item.storeName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400">
                      {formatDate(item.date)}
                    </Text>
                    <Text className="text-xs text-typography-500">
                      {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-bold text-typography-900">
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma Compra"
            message="Suas compras finalizadas aparecerão aqui."
            icon="bag-outline"
          />
        }
      />
    </View>
  );
}
