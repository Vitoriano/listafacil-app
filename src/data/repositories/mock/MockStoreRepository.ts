import { InMemoryStore } from '@/data/helpers/InMemoryStore';
import { simulateDelay } from '@/data/helpers/delay';
import type { IStoreRepository } from '../interfaces/IStoreRepository';
import type { Store } from '@/shared/types';
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
}
