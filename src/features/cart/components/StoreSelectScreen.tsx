import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useLocation } from '@/shared/hooks/useLocation';
import { logger } from '@/shared/utils/logger';
import { useNearbyStores } from '../hooks/useNearbyStores';
import { useCartStore } from '../stores/cartStore';
import type { Store } from '@/shared/types';

const STORE_TYPE_LABELS: Record<string, string> = {
  supermarket: 'Supermercado',
  hypermarket: 'Hipermercado',
  convenience: 'Conveniencia',
  wholesale: 'Atacado',
};

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

function ManualSelectButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="px-8 py-3.5"
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      <Text className="text-sm font-semibold text-primary-500">
        Selecionar manualmente
      </Text>
    </TouchableOpacity>
  );
}

export function StoreSelectScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const location = useLocation();
  const { data: stores, isLoading: isLoadingStores } = useNearbyStores(
    location.latitude,
    location.longitude,
  );
  const startSession = useCartStore((s) => s.startSession);
  const isStarting = useCartStore((s) => s.isStarting);

  function handleBack() {
    router.back();
  }

  function handleManualSelect() {
    router.push('/cart/manual-select');
  }

  async function handleSelectStore(store: Store) {
    logger.info('Cart', 'Store selected', store.id);
    try {
      await startSession(store.id, store.name);
      router.replace('/cart');
    } catch (error) {
      logger.error('Cart', 'Failed to start session', error);
    }
  }

  function renderLocationState() {
    if (location.status === 'requesting' || location.status === 'idle') {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-center text-sm text-typography-500">
            Obtendo sua localizacao...
          </Text>
        </View>
      );
    }

    if (location.status === 'denied') {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-error-50">
            <Ionicons name="location-outline" size={28} color={colors.error} />
          </View>
          <Text className="mb-1 text-lg font-bold text-typography-900">
            Permissao necessaria
          </Text>
          <Text className="mb-6 text-center text-sm leading-5 text-typography-500">
            Precisamos acessar sua localizacao para encontrar supermercados
            proximos a voce.
          </Text>
          <TouchableOpacity
            className="mb-3 rounded-full bg-primary-500 px-8 py-3.5"
            onPress={location.requestLocation}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-white">
              Tentar novamente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mb-3 rounded-full bg-background-100 px-8 py-3.5"
            onPress={location.openSettings}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-typography-600">
              Abrir configuracoes
            </Text>
          </TouchableOpacity>
          <ManualSelectButton onPress={handleManualSelect} />
        </View>
      );
    }

    if (location.status === 'gps_off') {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-warning-50">
            <Ionicons name="navigate-outline" size={28} color={colors.warning} />
          </View>
          <Text className="mb-1 text-lg font-bold text-typography-900">
            GPS desligado
          </Text>
          <Text className="mb-6 text-center text-sm leading-5 text-typography-500">
            Ative o GPS do seu dispositivo para que possamos encontrar
            supermercados proximos.
          </Text>
          <TouchableOpacity
            className="mb-3 rounded-full bg-primary-500 px-8 py-3.5"
            onPress={location.openLocationSettings}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-white">Ativar GPS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mb-3 rounded-full bg-background-100 px-8 py-3.5"
            onPress={location.requestLocation}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-typography-600">
              Tentar novamente
            </Text>
          </TouchableOpacity>
          <ManualSelectButton onPress={handleManualSelect} />
        </View>
      );
    }

    if (location.status === 'error') {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-error-50">
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={colors.error}
            />
          </View>
          <Text className="mb-1 text-lg font-bold text-typography-900">
            Erro ao obter localizacao
          </Text>
          <Text className="mb-6 text-center text-sm leading-5 text-typography-500">
            {location.errorMessage}
          </Text>
          <TouchableOpacity
            className="mb-3 rounded-full bg-primary-500 px-8 py-3.5"
            onPress={location.requestLocation}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-white">
              Tentar novamente
            </Text>
          </TouchableOpacity>
          <ManualSelectButton onPress={handleManualSelect} />
        </View>
      );
    }

    return null;
  }

  const isLocationReady = location.status === 'granted';
  const hasStores = stores && stores.length > 0;

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Escolher Supermercado" onBack={handleBack} />

      {!isLocationReady ? (
        renderLocationState()
      ) : isLoadingStores ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-center text-sm text-typography-500">
            Buscando supermercados proximos...
          </Text>
        </View>
      ) : !hasStores ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-background-100">
            <Ionicons
              name="storefront-outline"
              size={28}
              color={colors.textTertiary}
            />
          </View>
          <Text className="mb-1 text-lg font-bold text-typography-900">
            Nenhum supermercado encontrado
          </Text>
          <Text className="mb-6 text-center text-sm leading-5 text-typography-500">
            Nao encontramos supermercados num raio de 50km da sua localizacao.
          </Text>
          <TouchableOpacity
            className="mb-3 rounded-full bg-primary-500 px-8 py-3.5"
            onPress={location.requestLocation}
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-bold text-white">
              Atualizar localizacao
            </Text>
          </TouchableOpacity>
          <ManualSelectButton onPress={handleManualSelect} />
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-2 px-5 py-3">
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text className="flex-1 text-sm text-typography-500">
              Supermercados num raio de 50km
            </Text>
            <TouchableOpacity onPress={handleManualSelect}>
              <Text className="text-xs font-semibold text-primary-500">
                Selecionar manualmente
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const distance =
                location.latitude && location.longitude
                  ? getDistanceKm(
                      location.latitude,
                      location.longitude,
                      item.latitude,
                      item.longitude,
                    )
                  : null;

              return (
                <TouchableOpacity
                  onPress={() => handleSelectStore(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${item.name}`}
                  className="mb-2.5"
                  activeOpacity={0.7}
                  disabled={isStarting}
                >
                  <View className="flex-row items-center gap-3 rounded-2xl bg-background-0 p-4">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                      <Ionicons
                        name="storefront-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-typography-900">
                        {item.name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-typography-500">
                        {item.address}
                      </Text>
                      <Text className="text-xs text-typography-400">
                        {item.city}, {item.state}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <View className="rounded-full bg-background-50 px-2.5 py-1">
                        <Text className="text-xs text-typography-500">
                          {STORE_TYPE_LABELS[item.type] ?? item.type}
                        </Text>
                      </View>
                      {distance !== null && (
                        <Text className="text-xs font-semibold text-primary-500">
                          {formatDistance(distance)}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
}
