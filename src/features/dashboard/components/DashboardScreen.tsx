import React from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useSavings } from '@/features/profile/hooks/useSavings';
import { useLists } from '@/features/lists/hooks/useLists';
import { useProducts } from '@/features/products/hooks/useProducts';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardScreen() {
  const router = useRouter();
  const { data: user, isLoading: loadingUser } = useProfile();
  const { data: savings, isLoading: loadingSavings } = useSavings();
  const { data: lists, isLoading: loadingLists } = useLists();
  const { data: products, isLoading: loadingProducts } = useProducts({
    sortBy: 'price',
    limit: 6,
  });

  const androidPadding = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const recentLists = (lists ?? []).slice(0, 3);
  const topProducts = products?.data?.slice(0, 6) ?? [];
  const isLoading = loadingUser && loadingLists;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background-50" style={{ paddingTop: androidPadding }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-background-0 px-5 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-typography-500">
                {getGreeting()},{' '}
              </Text>
              <Text className="text-2xl font-bold text-typography-900">
                {user?.name?.split(' ')[0] ?? 'Visitante'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Ir para perfil"
              activeOpacity={0.7}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-500">
                <Text className="text-base font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Savings card */}
        {!loadingSavings ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile/savings')}
            activeOpacity={0.8}
            className="mx-4 mt-4"
          >
            <View className="rounded-2xl bg-primary-500 p-5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="wallet-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-xs font-semibold text-white opacity-80">
                  Sua Economia
                </Text>
              </View>
              <Text className="mt-1 text-3xl font-bold text-white">
                {formatCurrency(savings?.totalSavings ?? 0)}
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="send" size={12} color="rgba(255,255,255,0.7)" />
                    <Text className="text-xs text-white opacity-70">
                      {user?.totalSubmissions ?? 0} envios
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="cart" size={12} color="rgba(255,255,255,0.7)" />
                    <Text className="text-xs text-white opacity-70">
                      {savings?.recentPurchases?.length ?? 0} compras
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs font-semibold text-white opacity-80">Ver mais</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Quick actions */}
        <View className="mx-4 mt-5">
          <Text className="mb-3 text-sm font-bold text-typography-900">
            Acesso Rapido
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/scanner')}
              className="flex-1 items-center rounded-2xl bg-background-0 py-4"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Ionicons name="barcode-outline" size={22} color="#EA1D2C" />
              </View>
              <Text className="text-xs font-semibold text-typography-700">Scanner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/lists/create')}
              className="flex-1 items-center rounded-2xl bg-background-0 py-4"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-success-50">
                <Ionicons name="add-circle-outline" size={22} color="#05966A" />
              </View>
              <Text className="text-xs font-semibold text-typography-700">Nova Lista</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/products')}
              className="flex-1 items-center rounded-2xl bg-background-0 py-4"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-info-50">
                <Ionicons name="search-outline" size={22} color="#2563EB" />
              </View>
              <Text className="text-xs font-semibold text-typography-700">Buscar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/lists')}
              className="flex-1 items-center rounded-2xl bg-background-0 py-4"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-warning-50">
                <Ionicons name="list-outline" size={22} color="#D97706" />
              </View>
              <Text className="text-xs font-semibold text-typography-700">Listas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent lists */}
        <View className="mx-4 mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-typography-900">
              Minhas Listas
            </Text>
            {(lists ?? []).length > 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/lists')}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold text-primary-500">Ver todas</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {loadingLists ? (
            <View className="h-20 items-center justify-center">
              <LoadingSpinner size="small" />
            </View>
          ) : recentLists.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/lists/create')}
              activeOpacity={0.7}
            >
              <View className="items-center rounded-2xl border-2 border-dashed border-outline-200 py-8">
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-background-100">
                  <Ionicons name="add" size={24} color="#7D7D7D" />
                </View>
                <Text className="text-sm font-semibold text-typography-500">
                  Criar primeira lista
                </Text>
                <Text className="mt-0.5 text-xs text-typography-400">
                  Organize suas compras e economize
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="gap-2">
              {recentLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => router.push(`/lists/${list.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center rounded-2xl bg-background-0 p-4">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                      <Ionicons name="cart" size={18} color="#EA1D2C" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-typography-900">
                        {list.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-typography-500">
                        {list.itemCount} {list.itemCount === 1 ? 'item' : 'itens'}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-bold text-primary-500">
                        {formatCurrency(list.totalEstimate)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Best prices */}
        <View className="mt-6">
          <View className="mx-4 mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-typography-900">
              Melhores Precos
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/products')}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-primary-500">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <View className="h-32 items-center justify-center">
              <LoadingSpinner size="small" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={topProducts}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/products/${item.id}`)}
                  activeOpacity={0.7}
                  style={{ width: 150 }}
                >
                  <View className="rounded-2xl bg-background-0 p-3.5">
                    <View className="mb-2 h-16 w-full items-center justify-center rounded-xl bg-background-50">
                      <Ionicons name="cube-outline" size={24} color="#C8C8C8" />
                    </View>
                    <Text
                      className="text-xs font-bold text-typography-900"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-400" numberOfLines={1}>
                      {item.brand}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-success-600">
                        {formatCurrency(item.lowestPrice)}
                      </Text>
                      <View className="rounded-full bg-primary-50 px-2 py-0.5">
                        <Text className="text-xs font-semibold text-primary-600">
                          {item.priceCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Recent purchases */}
        {(savings?.recentPurchases?.length ?? 0) > 0 ? (
          <View className="mx-4 mt-6">
            <Text className="mb-3 text-sm font-bold text-typography-900">
              Compras Recentes
            </Text>
            <View className="gap-2">
              {savings!.recentPurchases.slice(0, 3).map((purchase, index) => (
                <View
                  key={`${purchase.listName}-${index}`}
                  className="flex-row items-center rounded-2xl bg-background-0 p-4"
                >
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-success-50">
                    <Ionicons name="bag-check-outline" size={18} color="#05966A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-typography-900">
                      {purchase.listName}
                    </Text>
                    <Text className="mt-0.5 text-xs text-typography-500">
                      {purchase.storeName}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-typography-900">
                      {formatCurrency(purchase.total)}
                    </Text>
                    <View className="mt-0.5 flex-row items-center gap-0.5">
                      <Ionicons name="trending-down" size={11} color="#05966A" />
                      <Text className="text-xs font-bold text-success-600">
                        -{formatCurrency(purchase.savings)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* FAB - Scanner */}
      <TouchableOpacity
        onPress={() => router.push('/scanner')}
        accessibilityRole="button"
        accessibilityLabel="Abrir scanner"
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#EA1D2C',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#EA1D2C',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
