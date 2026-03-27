import { useQuery } from '@tanstack/react-query';
import { storeRepository } from '@/data/repositories';
import type { Store } from '@/shared/types';

const RADIUS_KM = 50;

export function useNearbyStores(lat: number | null, lng: number | null) {
  return useQuery<Store[]>({
    queryKey: ['stores', 'nearby', lat, lng],
    queryFn: () => storeRepository.getNearby(lat!, lng!, RADIUS_KM),
    enabled: lat !== null && lng !== null,
  });
}
