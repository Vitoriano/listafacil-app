export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  type: 'supermarket' | 'hypermarket' | 'convenience' | 'wholesale';
  /** Distância até o usuário, devolvida pela API em buscas por proximidade. */
  distanceKm?: number;
  /** Place ID do Google, quando a loja foi cadastrada a partir do mapa/Places. */
  googlePlaceId?: string | null;
}

export interface CreateStorePayload {
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
}

/** Supermercado devolvido pelo Google Places (via API), ainda não cadastrado no banco. */
export interface NearbyPlace {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface NearbyPlacesResult {
  /** false quando a API não tem chave do Google configurada. */
  available: boolean;
  places: NearbyPlace[];
  nextPageToken?: string;
}
