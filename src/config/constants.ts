import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getExpoGoProjectConfig } from 'expo';

export const CURRENCY = 'BRL' as const;
export const CURRENCY_SYMBOL = 'R$' as const;
export const LOCALE = 'pt-BR' as const;

export const APP_NAME = 'Lista Fácil' as const;
export const APP_SLUG = 'listafacil-app' as const;

export const PAGINATION_LIMIT = 20 as const;

export const PRICE_MIN = 0.01;
export const PRICE_MAX = 99999.99;

/**
 * Extrai o IP/hostname do endereço do Metro (Ex.: `192.168.0.12:8081` → `192.168.0.12`).
 * É o mesmo PC onde corre `npx expo start` e, em LAN, costuma ser onde a API também corre.
 */
function hostFromPackagerAddress(
  address: string | undefined | null,
): string | null {
  if (address == null || typeof address !== 'string') return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  const withoutScheme = trimmed.replace(/^https?:\/\//i, '');
  const pathStart = withoutScheme.indexOf('/');
  const hostPort =
    pathStart === -1 ? withoutScheme : withoutScheme.slice(0, pathStart);

  const colonIdx = hostPort.lastIndexOf(':');
  if (colonIdx > 0) {
    const maybePort = hostPort.slice(colonIdx + 1);
    if (/^\d+$/.test(maybePort)) {
      return hostPort.slice(0, colonIdx);
    }
  }

  return hostPort || null;
}

/**
 * Host da máquina de desenvolvimento (para API + WebSocket em __DEV__).
 * Ordem: `EXPO_PUBLIC_API_HOST` → Expo Go `debuggerHost` → `expoConfig.hostUri` → manifest legado → fallback por plataforma.
 */
export function getLanDevHost(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (fromEnv) return fromEnv;

  const debuggerHost = getExpoGoProjectConfig()?.debuggerHost;
  const fromExpoGo = hostFromPackagerAddress(debuggerHost);
  if (fromExpoGo) return fromExpoGo;

  const fromHostUri = hostFromPackagerAddress(Constants.expoConfig?.hostUri);
  if (fromHostUri) return fromHostUri;

  const legacyManifest = Constants.manifest as
    | { debuggerHost?: string }
    | null
    | undefined;
  const fromLegacy = hostFromPackagerAddress(legacyManifest?.debuggerHost);
  if (fromLegacy) return fromLegacy;

  return null;
}

const API_PORT = process.env.EXPO_PUBLIC_API_PORT?.trim() || '3000';

/** URL base em produção / preview (EAS, etc.). */
const PRODUCTION_API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:3000/v1';

function resolveDevApiBaseUrl(): string {
  const lan = getLanDevHost();
  if (lan) {
    return `http://${lan}:${API_PORT}/v1`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/v1`;
  }
  return `http://localhost:${API_PORT}/v1`;
}

function resolveDevWsUrl(): string {
  const lan = getLanDevHost();
  if (lan) {
    return `http://${lan}:${API_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = __DEV__ ? resolveDevApiBaseUrl() : PRODUCTION_API_BASE;

export const WS_URL = __DEV__ ? resolveDevWsUrl() : PRODUCTION_API_BASE.replace(/\/v1\/?$/, '');
