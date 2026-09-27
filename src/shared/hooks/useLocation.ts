import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { logger } from '@/shared/utils/logger';

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
  /** true quando a posição veio do cache do sistema (rápida, pode estar defasada). */
  isApproximate: boolean;
  errorMessage: string | null;
}

/** Tempo máximo esperando um fix do GPS antes de cair para a última posição conhecida. */
const CURRENT_POSITION_TIMEOUT_MS = 12000;
/** Idade máxima aceitável da última posição conhecida. */
const LAST_KNOWN_MAX_AGE_MS = 15 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('location_timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Localização do usuário com dois estágios: a última posição conhecida aparece
 * na hora (se existir) e o fix atual do GPS refina depois. `getCurrentPositionAsync`
 * pode nunca responder em ambientes fechados, por isso há timeout com fallback.
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    latitude: null,
    longitude: null,
    isApproximate: false,
    errorMessage: null,
  });
  const requestIdRef = useRef(0);

  const requestLocation = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestId === requestIdRef.current;

    setState((prev) => ({ ...prev, status: 'requesting', errorMessage: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isCurrent()) return;

      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          status: 'denied',
          errorMessage: 'Permissão de localização negada.',
        }));
        return;
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isCurrent()) return;
      if (!isEnabled) {
        setState((prev) => ({
          ...prev,
          status: 'gps_off',
          errorMessage: 'O GPS está desligado. Ative-o para continuar.',
        }));
        return;
      }

      // 1) Última posição conhecida: resposta imediata enquanto o GPS procura o fix.
      let hasLastKnown = false;
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: LAST_KNOWN_MAX_AGE_MS,
        });
        if (lastKnown && isCurrent()) {
          hasLastKnown = true;
          setState({
            status: 'granted',
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            isApproximate: true,
            errorMessage: null,
          });
        }
      } catch (error) {
        logger.warn('Location', 'getLastKnownPositionAsync failed', error);
      }

      // 2) Posição atual com timeout; se falhar e já houver a última conhecida, mantém ela.
      try {
        const location = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
          }),
          CURRENT_POSITION_TIMEOUT_MS,
        );
        if (!isCurrent()) return;
        setState({
          status: 'granted',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          isApproximate: false,
          errorMessage: null,
        });
      } catch (error) {
        if (!isCurrent()) return;
        logger.warn('Location', 'getCurrentPositionAsync failed', error);
        if (hasLastKnown) return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage:
            'Não conseguimos um sinal de GPS. Tente perto de uma janela ou escolha o supermercado manualmente.',
        }));
      }
    } catch (error) {
      if (!isCurrent()) return;
      logger.error('Location', 'requestLocation failed', error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Não foi possível obter sua localização.',
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
    // Chamada assíncrona a uma API de plataforma (não é setState síncrono no efeito).
    void requestLocation();
    return () => {
      // Invalida respostas atrasadas após desmontar.
      requestIdRef.current += 1;
    };
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    openSettings,
    openLocationSettings,
  };
}
