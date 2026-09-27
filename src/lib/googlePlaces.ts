import { logger } from '@/shared/utils/logger';

/**
 * Cliente mínimo da Google Places Web Service (legado) usado pelo app.
 * A chave já é exposta pelo GooglePlacesAutocomplete do mapa; aqui reaproveitamos
 * para listar supermercados próximos mesmo sem cadastro no banco.
 */
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export interface NearbyPlace {
  placeId: string;
  name: string;
  /** Endereço curto ("vicinity"): rua, número e bairro. */
  address: string;
  latitude: number;
  longitude: number;
}

export interface PlaceDetails extends NearbyPlace {
  city: string;
  state: string;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface NearbyPage {
  places: NearbyPlace[];
  /** Token da próxima página (o Google libera após ~2 s); undefined na última. */
  nextPageToken?: string;
}

/** O Google devolve no máximo 3 páginas de 20 por busca. */
export const NEARBY_MAX_PAGES = 3;
/** Raio da busca por nome (metros). */
const TEXT_SEARCH_RADIUS_M = 50000;
/** Tempo que o Google exige antes de aceitar um next_page_token. */
const PAGE_TOKEN_DELAY_MS = 2000;

export function hasGooglePlacesKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RawPlace {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  business_status?: string;
  geometry?: { location?: { lat: number; lng: number } };
}

function mapRawPlaces(results: RawPlace[] | undefined): NearbyPlace[] {
  return (results ?? [])
    .filter((r) => r.business_status !== 'CLOSED_PERMANENTLY')
    .filter((r) => r.geometry?.location)
    .map((r) => ({
      placeId: r.place_id,
      name: r.name,
      address: r.vicinity ?? r.formatted_address ?? '',
      latitude: r.geometry!.location!.lat,
      longitude: r.geometry!.location!.lng,
    }));
}

export function extractCityState(addressComponents: AddressComponent[] | undefined): {
  city: string;
  state: string;
} {
  let city = '';
  let state = '';

  for (const component of addressComponents ?? []) {
    const types = component.types ?? [];
    if (types.includes('administrative_area_level_2') || types.includes('locality')) {
      city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      state = component.short_name;
    }
  }

  return { city, state };
}

/**
 * Uma página (20) de supermercados mais próximos do ponto, ordenados por distância.
 * Com `pageToken` busca a página seguinte (espera o tempo que o Google exige).
 */
export async function searchNearbySupermarkets(
  latitude: number,
  longitude: number,
  pageToken?: string,
): Promise<NearbyPage> {
  if (!hasGooglePlacesKey()) return { places: [] };

  const params = pageToken
    ? new URLSearchParams({ pagetoken: pageToken, key: GOOGLE_MAPS_API_KEY })
    : new URLSearchParams({
        location: `${latitude},${longitude}`,
        rankby: 'distance',
        type: 'supermarket',
        language: 'pt-BR',
        key: GOOGLE_MAPS_API_KEY,
      });

  if (pageToken) {
    await sleep(PAGE_TOKEN_DELAY_MS);
  }

  const fetchPage = async () => {
    const response = await fetch(`${BASE_URL}/nearbysearch/json?${params.toString()}`);
    return (await response.json()) as {
      status: string;
      error_message?: string;
      next_page_token?: string;
      results?: RawPlace[];
    };
  };

  let json = await fetchPage();
  // Token usado cedo demais: o Google responde INVALID_REQUEST; tenta uma vez mais.
  if (pageToken && json.status === 'INVALID_REQUEST') {
    await sleep(PAGE_TOKEN_DELAY_MS);
    json = await fetchPage();
  }

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    logger.warn('Places', 'nearbysearch failed', json.status, json.error_message);
    throw new Error(json.error_message ?? `Places: ${json.status}`);
  }

  return {
    places: mapRawPlaces(json.results),
    nextPageToken: json.next_page_token,
  };
}

/** Busca por nome ("Nordestão", "Atacadão Zona Norte") perto do usuário. */
export async function searchPlacesByName(
  query: string,
  latitude: number,
  longitude: number,
): Promise<NearbyPlace[]> {
  if (!hasGooglePlacesKey()) return [];

  const params = new URLSearchParams({
    query,
    location: `${latitude},${longitude}`,
    radius: String(TEXT_SEARCH_RADIUS_M),
    type: 'supermarket',
    language: 'pt-BR',
    key: GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(`${BASE_URL}/textsearch/json?${params.toString()}`);
  const json = (await response.json()) as {
    status: string;
    error_message?: string;
    results?: RawPlace[];
  };

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    logger.warn('Places', 'textsearch failed', json.status, json.error_message);
    throw new Error(json.error_message ?? `Places: ${json.status}`);
  }

  return mapRawPlaces(json.results);
}

/** Detalhes com cidade/UF, necessários para cadastrar a loja na API. */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'place_id,name,formatted_address,address_component,geometry',
    language: 'pt-BR',
    key: GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(`${BASE_URL}/details/json?${params.toString()}`);
  const json = (await response.json()) as {
    status: string;
    error_message?: string;
    result?: {
      place_id: string;
      name: string;
      formatted_address?: string;
      address_components?: AddressComponent[];
      geometry?: { location?: { lat: number; lng: number } };
    };
  };

  if (json.status !== 'OK' || !json.result?.geometry?.location) {
    logger.warn('Places', 'details failed', json.status, json.error_message);
    throw new Error(json.error_message ?? `Places: ${json.status}`);
  }

  const { result } = json;
  const { city, state } = extractCityState(result.address_components);
  return {
    placeId: result.place_id,
    name: result.name,
    address: result.formatted_address ?? '',
    city,
    state,
    latitude: result.geometry!.location!.lat,
    longitude: result.geometry!.location!.lng,
  };
}
