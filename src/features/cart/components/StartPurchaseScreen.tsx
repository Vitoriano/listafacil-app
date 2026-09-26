import React from 'react';
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import { useRecentPurchases } from '../hooks/usePurchases';

/** Estado da aba Comprar quando não há compra em andamento. */
export function StartPurchaseScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { data: recentPurchases } = useRecentPurchases(3);
  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      <View className="bg-background-0 px-5 pb-3 pt-4">
        <Text className="text-2xl font-bold text-typography-900">Comprar</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl bg-background-0 px-6 py-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <Ionicons name="cart" size={40} color={colors.primary} />
          </View>
          <Text className="text-xl font-bold text-typography-900">Modo compra</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-typography-500">
            Escolha o supermercado, escaneie os produtos conforme coloca no carrinho
            e acompanhe o total em tempo real.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/cart/store-select')}
            className="mt-6 w-full flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-4"
            accessibilityRole="button"
            accessibilityLabel="Iniciar compra"
            activeOpacity={0.8}
          >
            <Ionicons name="storefront-outline" size={20} color={colors.white} />
            <Text className="text-sm font-bold text-white">Iniciar compra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.navigate('/lists')}
            className="mt-3 w-full flex-row items-center justify-center gap-2 rounded-full border-2 border-outline-200 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="Comprar a partir de uma lista"
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={20} color={colors.icon} />
            <Text className="text-sm font-bold text-typography-700">Comprar a partir de uma lista</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-typography-900">Compras recentes</Text>
            <TouchableOpacity onPress={() => router.push('/purchases/history')} activeOpacity={0.7}>
              <Text className="text-xs font-semibold text-primary-500">Ver histórico</Text>
            </TouchableOpacity>
          </View>
          {(recentPurchases ?? []).length === 0 ? (
            <View className="items-center rounded-2xl bg-background-0 py-8">
              <Ionicons name="bag-outline" size={28} color={colors.textMuted} />
              <Text className="mt-2 text-xs text-typography-400">
                Suas compras finalizadas aparecerão aqui.
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {recentPurchases!.map((purchase) => (
                <TouchableOpacity
                  key={purchase.id}
                  onPress={() => router.push(`/purchases/${purchase.id}`)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Compra em ${purchase.storeName}`}
                >
                  <View className="flex-row items-center rounded-2xl bg-background-0 p-4">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-success-50">
                      <Ionicons name="bag-check-outline" size={18} color={colors.success} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-typography-900">
                        {purchase.storeName || 'Loja'}
                      </Text>
                      <Text className="mt-0.5 text-xs text-typography-500">
                        {purchase.date ? formatDate(purchase.date) : '—'} · {purchase.itemCount ?? 0}{' '}
                        {(purchase.itemCount ?? 0) === 1 ? 'item' : 'itens'}
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-typography-900">
                      {formatCurrency(purchase.total)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
