import { useQuery } from '@tanstack/react-query';
import { hasGooglePlacesKey, searchNearbySupermarkets, type NearbyPlace } from '@/lib/googlePlaces';

/** Supermercados próximos via Google Places (independe do cadastro no banco). */
export function useNearbyPlaces(lat: number | null, lng: number | null) {
  return useQuery<NearbyPlace[]>({
    // Arredonda para ~100 m: pequenas variações do GPS não refazem a busca.
    queryKey: ['places', 'nearby', lat?.toFixed(3), lng?.toFixed(3)],
    queryFn: () => searchNearbySupermarkets(lat!, lng!),
    enabled: lat !== null && lng !== null && hasGooglePlacesKey(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
