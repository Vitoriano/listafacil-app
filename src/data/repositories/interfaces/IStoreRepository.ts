import type { Store } from '@/shared/types';

export interface IStoreRepository {
  getAll(): Promise<Store[]>;
  getById(id: string): Promise<Store | null>;
  getNearby(lat: number, lng: number, radiusKm?: number): Promise<Store[]>;
}
