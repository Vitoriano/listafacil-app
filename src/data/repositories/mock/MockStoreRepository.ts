import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IStoreRepository } from '../interfaces/IStoreRepository';
import type { Store, CreateStorePayload, NearbyPlacesResult } from '@/shared/types';
import seedStores from '@/data/seed/stores.json';

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class MockStoreRepository implements IStoreRepository {
  private store: InMemoryStore<Store>;

  constructor() {
    this.store = new InMemoryStore<Store>(seedStores as Store[]);
  }

  async getAll(): Promise<Store[]> {
    await simulateDelay();
    return this.store.getAll();
  }

  async getById(id: string): Promise<Store | null> {
    await simulateDelay();
    return this.store.getById(id);
  }

  async getNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
  ): Promise<Store[]> {
    await simulateDelay();

    return this.store.filter((store) => {
      const distance = haversineDistanceKm(
        lat,
        lng,
        store.latitude,
        store.longitude,
      );
      return distance <= radiusKm;
    });
  }

  async create(payload: CreateStorePayload): Promise<Store> {
    await simulateDelay();
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: payload.name,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      latitude: payload.latitude,
      longitude: payload.longitude,
      type: 'supermarket',
    };
    this.store.create(newStore);
    return newStore;
  }

  async getNearbyPlaces(): Promise<NearbyPlacesResult> {
    await simulateDelay();
    return { available: false, places: [] };
  }

  async searchPlacesByName(): Promise<NearbyPlacesResult> {
    await simulateDelay();
    return { available: false, places: [] };
  }

  async createFromPlace(placeId: string): Promise<Store> {
    await simulateDelay();
    const existing = this.store.getAll().find((s) => s.googlePlaceId === placeId);
    if (existing) return existing;
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: 'Mercado Google',
      address: 'Endereço do Google',
      city: 'Natal',
      state: 'RN',
      latitude: 0,
      longitude: 0,
      type: 'supermarket',
      googlePlaceId: placeId,
    };
    this.store.create(newStore);
    return newStore;
  }
}
