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
import { usePurchaseDetail } from '../hooks/usePurchaseDetail';

export function PurchaseDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: purchase, isLoading } = usePurchaseDetail(id ?? null);

  function handleBack() {
    router.back();
  }

  function handleNewPurchase() {
    router.push('/cart/store-select');
  }

  function handleViewHistory() {
    router.push('/cart/history');
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
                {purchase.storeName || 'Loja'}
              </Text>
              <Text className="mt-0.5 text-xs text-typography-400">
                {purchase.date ? formatDate(purchase.date) : '—'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-primary-500">
                {formatCurrency(purchase.total)}
              </Text>
              <Text className="text-xs text-typography-500">
                {purchase.itemCount ?? 0} {(purchase.itemCount ?? 0) === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <Text className="mb-3 text-sm font-bold text-typography-900">Itens</Text>
        <View className="gap-2">
          {(purchase.items ?? []).map((item, index) => (
            <View
              key={item.id || index}
              className="flex-row items-center justify-between rounded-2xl bg-background-0 p-4"
            >
              <View className="mr-3 flex-1">
                <Text className="text-sm font-bold text-typography-900" numberOfLines={2}>
                  {item.productName || 'Produto'}
                </Text>
                <Text className="mt-0.5 text-xs text-typography-400">
                  {item.quantity ?? 1}x {formatCurrency(item.price)}
                </Text>
              </View>
              <Text className="text-sm font-bold text-typography-900">
                {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
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

        {/* Action buttons */}
        <View className="mt-4 gap-3">
          <TouchableOpacity
            onPress={handleNewPurchase}
            accessibilityRole="button"
            accessibilityLabel="Nova Compra"
            className="flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Nova Compra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewHistory}
            accessibilityRole="button"
            accessibilityLabel="Ver Histórico"
            className="flex-row items-center justify-center gap-2 rounded-full border-2 border-outline-300 py-3.5"
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={colors.icon} />
            <Text className="text-sm font-bold text-typography-700">Ver Histórico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
