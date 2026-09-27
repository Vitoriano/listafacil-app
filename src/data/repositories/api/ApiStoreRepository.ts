import { api } from '@/config/api';
import type { IStoreRepository } from '../interfaces/IStoreRepository';
import type { Store, CreateStorePayload, NearbyPlacesResult } from '@/shared/types';

export class ApiStoreRepository implements IStoreRepository {
  async getAll(): Promise<Store[]> {
    const { data } = await api.get('/stores', {
      params: { limit: 50 },
    });
    // API returns paginated, extract data array
    return Array.isArray(data) ? data : data.data ?? data;
  }

  async getById(id: string): Promise<Store | null> {
    try {
      const { data } = await api.get(`/stores/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async getNearby(
    lat: number,
    lng: number,
    radiusKm?: number,
  ): Promise<Store[]> {
    const { data } = await api.get('/stores', {
      params: { lat, lng, radiusKm, limit: 50 },
    });
    return Array.isArray(data) ? data : data.data ?? data;
  }

  async create(payload: CreateStorePayload): Promise<Store> {
    const { data } = await api.post('/stores', payload);
    return data;
  }

  async getNearbyPlaces(
    lat: number,
    lng: number,
    pageToken?: string,
  ): Promise<NearbyPlacesResult> {
    const { data } = await api.get('/stores/places/nearby', {
      params: { lat, lng, pageToken },
    });
    return data as NearbyPlacesResult;
  }

  async searchPlacesByName(
    query: string,
    lat: number,
    lng: number,
  ): Promise<NearbyPlacesResult> {
    const { data } = await api.get('/stores/places/search', {
      params: { q: query, lat, lng },
    });
    return data as NearbyPlacesResult;
  }

  async createFromPlace(placeId: string): Promise<Store> {
    const { data } = await api.post(`/stores/places/${encodeURIComponent(placeId)}`);
    return data as Store;
  }
}
