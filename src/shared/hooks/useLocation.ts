import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'gps_off'
  | 'error';

interface LocationState {
  status: LocationStatus;
  latitude: number | null;
  longitude: number | null;
  errorMessage: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    latitude: null,
    longitude: null,
    errorMessage: null,
  });

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'requesting', errorMessage: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          status: 'denied',
          errorMessage: 'Permissao de localizacao negada.',
        }));
        return;
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        setState((prev) => ({
          ...prev,
          status: 'gps_off',
          errorMessage: 'O GPS esta desligado. Ative-o para continuar.',
        }));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        status: 'granted',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        errorMessage: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Nao foi possivel obter sua localizacao.',
      }));
    }
  }, []);

  function openSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  function openLocationSettings() {
    if (Platform.OS === 'android') {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(
        () => Linking.openSettings(),
      );
    } else {
      Linking.openURL('app-settings:');
    }
  }

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    openSettings,
    openLocationSettings,
  };
}
