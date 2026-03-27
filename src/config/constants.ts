export const CURRENCY = 'BRL' as const;
export const CURRENCY_SYMBOL = 'R$' as const;
export const LOCALE = 'pt-BR' as const;

export const APP_NAME = 'Lista Fácil' as const;
export const APP_SLUG = 'listafacil-app' as const;

export const PAGINATION_LIMIT = 20 as const;

export const PRICE_MIN = 0.01;
export const PRICE_MAX = 99999.99;

// In dev, Expo serves from your machine's IP — reuse it for the API.
// Falls back to localhost for web or production builds.
import Constants from 'expo-constants';

const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_BASE_URL = __DEV__ && devHost
  ? `http://${devHost}:3000/v1`
  : 'http://localhost:3000/v1';

export const WS_URL = __DEV__ && devHost
  ? `http://${devHost}:3000`
  : 'http://localhost:3000';
