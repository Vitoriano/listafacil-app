import type {
  Store,
  CreateStorePayload,
  NearbyPlacesResult,
} from '@/shared/types';

export interface IStoreRepository {
  getAll(): Promise<Store[]>;
  getById(id: string): Promise<Store | null>;
  getNearby(lat: number, lng: number, radiusKm?: number): Promise<Store[]>;
  create(payload: CreateStorePayload): Promise<Store>;

  // Google Places via API (chave e cache ficam no servidor)
  /** 20 supermercados mais próximos por página; `pageToken` pega a próxima. */
  getNearbyPlaces(lat: number, lng: number, pageToken?: string): Promise<NearbyPlacesResult>;
  /** Busca por nome perto do usuário. */
  searchPlacesByName(query: string, lat: number, lng: number): Promise<NearbyPlacesResult>;
  /** Cadastra (uma única vez) a loja a partir do place id e devolve o registro. */
  createFromPlace(placeId: string): Promise<Store>;
}
