import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { storeRepository } from '@/data/repositories';
import type { NearbyPlace, NearbyPlacesResult } from '@/shared/types';

/** O Google devolve no máximo 3 páginas de 20 por busca. */
const NEARBY_MAX_PAGES = 3;

interface NearbyPlacesData {
  places: NearbyPlace[];
  /** undefined até a primeira resposta; false quando a API não tem chave do Google. */
  available: boolean | undefined;
}

/**
 * Supermercados próximos via API (Google Places no servidor, cacheado), 20 por
 * página ("Carregar mais"). Só busca quando `enabled` é true: a tela decide se o
 * banco já cobre a região ou se vale gastar uma chamada no Google.
 */
export function useNearbyPlaces(lat: number | null, lng: number | null, enabled: boolean) {
  const query = useInfiniteQuery<
    NearbyPlacesResult,
    Error,
    NearbyPlacesData,
    readonly unknown[],
    string | undefined
  >({
    // Arredonda para ~100 m: pequenas variações do GPS não refazem a busca.
    queryKey: ['places', 'nearby', lat?.toFixed(3), lng?.toFixed(3)],
    queryFn: ({ pageParam }) => storeRepository.getNearbyPlaces(lat!, lng!, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.available && allPages.length < NEARBY_MAX_PAGES
        ? lastPage.nextPageToken
        : undefined,
    select: (data) => ({
      places: data.pages.flatMap((page) => page.places),
      available: data.pages[0]?.available,
    }),
    enabled: enabled && lat !== null && lng !== null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    places: query.data?.places,
    available: query.data?.available,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}

/** Busca por nome (a partir de 3 letras), perto do usuário, via API. */
export function useSearchPlaces(
  name: string,
  lat: number | null,
  lng: number | null,
  enabled: boolean,
) {
  const term = name.trim();
  const query = useQuery<NearbyPlacesResult>({
    queryKey: ['places', 'search', term.toLowerCase(), lat?.toFixed(3), lng?.toFixed(3)],
    queryFn: () => storeRepository.searchPlacesByName(term, lat!, lng!),
    enabled: enabled && term.length >= 3 && lat !== null && lng !== null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  return {
    places: query.data?.places,
    available: query.data?.available,
    isFetching: query.isFetching,
  };
}
