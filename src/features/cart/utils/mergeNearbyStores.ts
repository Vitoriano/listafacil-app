import type { Store } from '@/shared/types';
import type { NearbyPlace } from '@/lib/googlePlaces';

export type NearbyOption =
  | { kind: 'store'; key: string; store: Store; distanceKm: number | null }
  | { kind: 'place'; key: string; place: NearbyPlace; distanceKm: number | null };

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Mesmo nome (sem acento/caixa) a menos de 150 m: considera a mesma loja. */
const SAME_STORE_MAX_KM = 0.15;

/**
 * Junta lojas cadastradas (API) e resultados do Google Places em uma lista única,
 * sem repetição: a loja cadastrada sempre vence (tem preços e histórico) e o
 * resultado do Google só aparece quando ainda não existe no banco.
 */
export function mergeNearbyStores(
  stores: Store[] | undefined,
  places: NearbyPlace[] | undefined,
  origin: { latitude: number | null; longitude: number | null },
): NearbyOption[] {
  const distanceTo = (lat: number, lng: number): number | null =>
    origin.latitude !== null && origin.longitude !== null
      ? haversineKm(origin.latitude, origin.longitude, lat, lng)
      : null;

  const storeOptions: NearbyOption[] = (stores ?? []).map((store) => ({
    kind: 'store',
    key: `store:${store.id}`,
    store,
    distanceKm: store.distanceKm ?? distanceTo(store.latitude, store.longitude),
  }));

  const knownPlaceIds = new Set(
    (stores ?? []).map((s) => s.googlePlaceId).filter((id): id is string => !!id),
  );

  const placeOptions: NearbyOption[] = (places ?? [])
    .filter((place) => !knownPlaceIds.has(place.placeId))
    .filter((place) => {
      const name = normalizeName(place.name);
      return !(stores ?? []).some(
        (store) =>
          normalizeName(store.name) === name &&
          haversineKm(store.latitude, store.longitude, place.latitude, place.longitude) <=
            SAME_STORE_MAX_KM,
      );
    })
    .map((place) => ({
      kind: 'place',
      key: `place:${place.placeId}`,
      place,
      distanceKm: distanceTo(place.latitude, place.longitude),
    }));

  return [...storeOptions, ...placeOptions].sort((a, b) => {
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}
