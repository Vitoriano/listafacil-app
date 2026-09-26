export const CURRENCY = 'BRL' as const;
export const CURRENCY_SYMBOL = 'R$' as const;
export const LOCALE = 'pt-BR' as const;

export const APP_NAME = 'Lista Fácil' as const;
export const APP_SLUG = 'listafacil-app' as const;

export const PAGINATION_LIMIT = 20 as const;

export const PRICE_MIN = 0.01;
export const PRICE_MAX = 99999.99;

/** API de homologação: destino padrão do app em qualquer modo (dev, preview e produção). */
export const DEFAULT_API_BASE_URL = 'https://api.listafacil.nataldev.com.br/v1';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * URL base da API. Sempre aponta para homologação; `EXPO_PUBLIC_API_URL` permite trocar
 * o destino (ex.: produção no EAS / GitHub Actions). Não existe mais fallback para
 * localhost nem para o IP da máquina na LAN.
 */
export const API_BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL,
);

/** URL do socket.io: raiz da API, sem o prefixo de versão. */
export const WS_URL = API_BASE_URL.replace(/\/v1$/, '');
