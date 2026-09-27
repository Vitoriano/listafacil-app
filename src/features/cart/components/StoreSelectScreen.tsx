import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useLocation, type LocationStatus } from '@/shared/hooks/useLocation';
import { logger } from '@/shared/utils/logger';
import { storeRepository } from '@/data/repositories';
import { getPlaceDetails, hasGooglePlacesKey, type NearbyPlace } from '@/lib/googlePlaces';
import { useNearbyStores } from '../hooks/useNearbyStores';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { useStartPurchase } from '../hooks/useStartPurchase';
import { useLinkedListParam } from '../hooks/useLinkedListParam';
import { mergeNearbyStores } from '../utils/mergeNearbyStores';
import { LinkedListChip } from './LinkedListChip';
import type { Store } from '@/shared/types';

const STORE_TYPE_LABELS: Record<string, string> = {
  supermarket: 'Supermercado',
  hypermarket: 'Hipermercado',
  convenience: 'Conveniencia',
  wholesale: 'Atacado',
};

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
  // Google Places: mostra supermercados da região mesmo sem cadastro no banco.
  const { data: places, isLoading: isLoadingPlaces } = useNearbyPlaces(
    location.latitude,
    location.longitude,
  );
  const { start, isStarting } = useStartPurchase();
  const linked = useLinkedListParam();
  const [registeringPlaceId, setRegisteringPlaceId] = useState<string | null>(null);

  const options = useMemo(
    () => mergeNearbyStores(stores, places, location),
    // location muda de identidade a cada render; só lat/lng importam aqui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stores, places, location.latitude, location.longitude],
  );
  const isWaitingForGps = location.status === 'requesting' || location.status === 'idle';
  const [slowSince, setSlowSince] = useState<LocationStatus | null>(null);

  // Depois de alguns segundos sem resposta do GPS, avisa e destaca a escolha manual.
  useEffect(() => {
    if (!isWaitingForGps) return;
    const timer = setTimeout(() => setSlowSince(location.status), 5000);
    return () => clearTimeout(timer);
  }, [isWaitingForGps, location.status]);
  const isTakingLong = isWaitingForGps && slowSince !== null;

  function handleBack() {
    router.back();
  }

  function handleManualSelect() {
    router.push({ pathname: '/cart/manual-select', params: linked.params });
  }

  async function handleSelectStore(store: Store) {
    logger.info('Cart', 'Store selected', store.id);
    const ok = await start({
      storeId: store.id,
      storeName: store.name,
      linkedList: linked.linkedList,
    });
    if (ok) {
      // Volta direto para o carrinho, descartando as telas de escolha da pilha.
      router.dismissTo('/cart');
    }
  }

  /**
   * Loja vinda do Google: cadastra na API (idempotente por googlePlaceId, a API
   * devolve a existente) e inicia a compra com o registro persistido.
   */
  async function handleSelectPlace(place: NearbyPlace) {
    logger.info('Cart', 'Google place selected', place.placeId);
    setRegisteringPlaceId(place.placeId);
    try {
      const details = await getPlaceDetails(place.placeId);
      const store = await storeRepository.create({
        name: details.name || place.name,
        address: details.address || place.address,
        city: details.city,
        state: details.state,
        latitude: details.latitude,
        longitude: details.longitude,
        googlePlaceId: place.placeId,
      });
      const ok = await start({
        storeId: store.id,
        storeName: store.name,
        linkedList: linked.linkedList,
      });
      if (ok) {
        router.dismissTo('/cart');
      }
    } catch (error) {
      logger.error('Cart', 'Failed to register place', error);
      Alert.alert(
        'Não foi possível cadastrar',
        'Tente novamente ou escolha o supermercado pelo mapa.',
      );
    } finally {
      setRegisteringPlaceId(null);
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
            {isTakingLong
              ? 'O GPS está demorando para responder...'
              : 'Obtendo sua localização...'}
          </Text>
          {isTakingLong ? (
            <Text className="mt-2 text-center text-xs leading-5 text-typography-400">
              Em lugares fechados o sinal pode falhar. Você pode escolher o
              supermercado manualmente enquanto isso.
            </Text>
          ) : null}
          <View className="mt-6">
            {isTakingLong ? (
              <TouchableOpacity
                className="rounded-full bg-primary-500 px-8 py-3.5"
                onPress={handleManualSelect}
                accessibilityRole="button"
                accessibilityLabel="Selecionar manualmente"
                activeOpacity={0.8}
              >
                <Text className="text-sm font-bold text-white">Selecionar manualmente</Text>
              </TouchableOpacity>
            ) : (
              <ManualSelectButton onPress={handleManualSelect} />
            )}
          </View>
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
  const isLoadingOptions = isLoadingStores || (hasGooglePlacesKey() && isLoadingPlaces);
  const hasOptions = options.length > 0;
  const isBusy = isStarting || registeringPlaceId !== null;

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Escolher Supermercado" onBack={handleBack} />
      {linked.linkedList ? <LinkedListChip listName={linked.linkedList.name} /> : null}

      {!isLocationReady ? (
        renderLocationState()
      ) : isLoadingOptions && !hasOptions ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-center text-sm text-typography-500">
            Buscando supermercados proximos...
          </Text>
        </View>
      ) : !hasOptions ? (
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
            Não encontramos supermercados perto da sua localização.
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
              {location.isApproximate
                ? 'Perto da sua última localização'
                : 'Supermercados num raio de 50km'}
            </Text>
            <TouchableOpacity onPress={handleManualSelect}>
              <Text className="text-xs font-semibold text-primary-500">
                Selecionar manualmente
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isStore = item.kind === 'store';
              const name = isStore ? item.store.name : item.place.name;
              const address = isStore ? item.store.address : item.place.address;
              const secondary = isStore
                ? `${item.store.city}, ${item.store.state}`
                : 'Toque para cadastrar e começar a compra';
              const isRegistering = !isStore && registeringPlaceId === item.place.placeId;

              return (
                <TouchableOpacity
                  onPress={() =>
                    isStore ? handleSelectStore(item.store) : handleSelectPlace(item.place)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${name}`}
                  className="mb-2.5"
                  activeOpacity={0.7}
                  disabled={isBusy}
                >
                  <View className="flex-row items-center gap-3 rounded-2xl bg-background-0 p-4">
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-full ${
                        isStore ? 'bg-primary-50' : 'bg-background-100'
                      }`}
                    >
                      {isRegistering ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons
                          name={isStore ? 'storefront' : 'storefront-outline'}
                          size={20}
                          color={isStore ? colors.primary : colors.textTertiary}
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-typography-900" numberOfLines={1}>
                        {name}
                      </Text>
                      <Text className="mt-0.5 text-xs text-typography-500" numberOfLines={2}>
                        {address}
                      </Text>
                      <Text className="text-xs text-typography-400" numberOfLines={1}>
                        {secondary}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <View
                        className={`rounded-full px-2.5 py-1 ${
                          isStore ? 'bg-success-50' : 'bg-background-50'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            isStore ? 'font-semibold text-success-700' : 'text-typography-500'
                          }`}
                        >
                          {isStore
                            ? STORE_TYPE_LABELS[item.store.type] ?? item.store.type
                            : 'Google'}
                        </Text>
                      </View>
                      {item.distanceKm !== null && (
                        <Text className="text-xs font-semibold text-primary-500">
                          {formatDistance(item.distanceKm)}
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
