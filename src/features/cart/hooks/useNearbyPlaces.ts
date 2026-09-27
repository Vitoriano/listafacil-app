import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  hasGooglePlacesKey,
  NEARBY_MAX_PAGES,
  searchNearbySupermarkets,
  searchPlacesByName,
  type NearbyPage,
  type NearbyPlace,
} from '@/lib/googlePlaces';

/**
 * Supermercados próximos via Google Places, 20 por página ("Carregar mais"),
 * até o máximo de 3 páginas que o Google permite.
 */
export function useNearbyPlaces(lat: number | null, lng: number | null) {
  const query = useInfiniteQuery<NearbyPage, Error, NearbyPlace[], readonly unknown[], string | undefined>({
    // Arredonda para ~100 m: pequenas variações do GPS não refazem a busca.
    queryKey: ['places', 'nearby', lat?.toFixed(3), lng?.toFixed(3)],
    queryFn: ({ pageParam }) => searchNearbySupermarkets(lat!, lng!, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage, allPages) =>
      allPages.length < NEARBY_MAX_PAGES ? lastPage.nextPageToken : undefined,
    select: (data) => data.pages.flatMap((page) => page.places),
    enabled: lat !== null && lng !== null && hasGooglePlacesKey(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

/** Busca por nome no Google (a partir de 3 letras), perto do usuário. */
export function useSearchPlaces(name: string, lat: number | null, lng: number | null) {
  const term = name.trim();
  return useQuery<NearbyPlace[]>({
    queryKey: ['places', 'search', term.toLowerCase(), lat?.toFixed(3), lng?.toFixed(3)],
    queryFn: () => searchPlacesByName(term, lat!, lng!),
    enabled: term.length >= 3 && lat !== null && lng !== null && hasGooglePlacesKey(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
