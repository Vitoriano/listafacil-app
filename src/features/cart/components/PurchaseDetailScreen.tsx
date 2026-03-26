import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { usePurchaseDetail } from '../hooks/usePurchaseDetail';

export function PurchaseDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: purchase, isLoading } = usePurchaseDetail(id ?? null);

  function handleBack() {
    router.back();
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!purchase) {
    return (
      <View className="flex-1 bg-background-50">
        <AppHeader title="Detalhe da Compra" onBack={handleBack} />
        <EmptyState
          title="Compra Nao Encontrada"
          message="A compra que voce procura nao existe."
          icon="alert-circle-outline"
          action={{ label: 'Voltar', onPress: handleBack }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Detalhe da Compra" onBack={handleBack} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Store and date info */}
        <View className="mb-4 rounded-2xl bg-background-0 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
              <Ionicons name="storefront-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-typography-900">
                {purchase.storeName}
              </Text>
              <Text className="mt-0.5 text-xs text-typography-400">
                {formatDate(purchase.date)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-primary-500">
                {formatCurrency(purchase.total)}
              </Text>
              <Text className="text-xs text-typography-500">
                {purchase.itemCount} {purchase.itemCount === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <Text className="mb-3 text-sm font-bold text-typography-900">Itens</Text>
        <View className="gap-2">
          {purchase.items.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between rounded-2xl bg-background-0 p-4"
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-bold text-typography-900" numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text className="mt-0.5 text-xs text-typography-400">
                  {item.quantity}x {formatCurrency(item.price)}
                </Text>
              </View>
              <Text className="text-sm font-bold text-typography-900">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View className="mt-4 rounded-2xl bg-primary-50 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-typography-700">Total</Text>
            <Text className="text-xl font-bold text-primary-500">
              {formatCurrency(purchase.total)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
