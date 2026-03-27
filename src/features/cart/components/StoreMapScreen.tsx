import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/components/AppHeader';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useLocation } from '@/shared/hooks/useLocation';
import { logger } from '@/shared/utils/logger';
import { storeRepository } from '@/data/repositories';
import { useCartStore } from '../stores/cartStore';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface SelectedPlace {
  placeId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

function extractCityState(addressComponents: any[]): {
  city: string;
  state: string;
} {
  let city = '';
  let state = '';

  for (const component of addressComponents ?? []) {
    const types: string[] = component.types ?? [];
    if (
      types.includes('administrative_area_level_2') ||
      types.includes('locality')
    ) {
      city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      state = component.short_name;
    }
  }

  return { city, state };
}

export function StoreMapScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const location = useLocation();
  const startSession = useCartStore((s) => s.startSession);
  const isStarting = useCartStore((s) => s.isStarting);
  const mapRef = useRef<MapView>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
  const [isRegistering, setIsRegistering] = useState(false);

  const initialRegion: Region =
    location.latitude && location.longitude
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: -14.235,
          longitude: -51.9253,
          latitudeDelta: 20,
          longitudeDelta: 20,
        };

  function handlePlaceSelected(data: any, details: any) {
    Keyboard.dismiss();

    const lat = details?.geometry?.location?.lat;
    const lng = details?.geometry?.location?.lng;
    if (!lat || !lng) return;

    const { city, state } = extractCityState(
      details?.address_components ?? [],
    );

    const place: SelectedPlace = {
      placeId: data.place_id,
      name: details?.name ?? data.structured_formatting?.main_text ?? '',
      address: details?.formatted_address ?? '',
      city,
      state,
      latitude: lat,
      longitude: lng,
    };

    setSelectedPlace(place);

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600,
    );
  }

  async function handleConfirm() {
    if (!selectedPlace) return;

    setIsRegistering(true);
    try {
      const store = await storeRepository.create({
        name: selectedPlace.name,
        address: selectedPlace.address,
        city: selectedPlace.city,
        state: selectedPlace.state,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        googlePlaceId: selectedPlace.placeId,
      });

      await startSession(store.id, store.name);
      router.replace('/cart');
    } catch (error) {
      logger.error('Cart', 'Failed to register store and start session', error);
    } finally {
      setIsRegistering(false);
    }
  }

  function handleCenterOnUser() {
    if (location.latitude && location.longitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500,
      );
    }
  }

  const isProcessing = isStarting || isRegistering;

  return (
    <View className="flex-1 bg-background-50">
      <AppHeader title="Selecionar no Mapa" onBack={() => router.back()} />

      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }}
              pinColor={colors.primary}
            />
          )}
        </MapView>

        {/* Search input overlay */}
        <View
          className="absolute left-4 right-4 top-3"
          style={{ zIndex: 10 }}
        >
          <GooglePlacesAutocomplete
            placeholder="Buscar supermercado..."
            onPress={handlePlaceSelected}
            fetchDetails
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'pt-BR',
              components: 'country:br',
              type: 'establishment',
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            GooglePlacesSearchQuery={{
              rankby: 'distance',
              type: 'supermarket',
            }}
            debounce={300}
            minLength={2}
            enablePoweredByContainer={false}
            textInputProps={{
              placeholderTextColor: colors.textQuaternary,
              returnKeyType: 'search',
            }}
            styles={{
              container: {
                flex: 0,
              },
              textInputContainer: {
                backgroundColor: 'transparent',
              },
              textInput: {
                height: 46,
                fontSize: 14,
                backgroundColor: colors.background,
                borderRadius: 12,
                paddingHorizontal: 16,
                color: colors.text,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
              },
              listView: {
                backgroundColor: colors.background,
                borderRadius: 12,
                marginTop: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
                overflow: 'hidden',
              },
              row: {
                backgroundColor: colors.background,
                paddingVertical: 12,
                paddingHorizontal: 14,
              },
              separator: {
                height: 1,
                backgroundColor: colors.border,
              },
              description: {
                color: colors.text,
                fontSize: 13,
              },
            }}
          />
        </View>

        {/* Botao centralizar */}
        {location.latitude && location.longitude && (
          <TouchableOpacity
            className="absolute right-4 h-11 w-11 items-center justify-center rounded-full bg-background-0"
            style={{
              bottom: selectedPlace ? 180 : 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handleCenterOnUser}
            accessibilityRole="button"
            accessibilityLabel="Centralizar no mapa"
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Card do lugar selecionado */}
        {selectedPlace && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-background-0 px-5 pb-8 pt-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-typography-900">
                  {selectedPlace.name}
                </Text>
                <Text
                  className="mt-0.5 text-xs text-typography-500"
                  numberOfLines={2}
                >
                  {selectedPlace.address}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="items-center rounded-full bg-primary-500 py-3.5"
              onPress={handleConfirm}
              disabled={isProcessing}
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  Selecionar este supermercado
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
