import { mergeNearbyStores } from '@/features/cart/utils/mergeNearbyStores';
import type { Store } from '@/shared/types';
import type { NearbyPlace } from '@/lib/googlePlaces';

const origin = { latitude: -5.79, longitude: -35.21 };

function store(overrides: Partial<Store>): Store {
  return {
    id: 'store-1',
    name: 'Supermercado Nordestão',
    address: 'Av. Prudente de Morais, 100',
    city: 'Natal',
    state: 'RN',
    latitude: -5.791,
    longitude: -35.211,
    type: 'supermarket',
    ...overrides,
  };
}

function place(overrides: Partial<NearbyPlace>): NearbyPlace {
  return {
    placeId: 'place-1',
    name: 'Supermercado Nordestão',
    address: 'Av. Prudente de Morais, 100 - Tirol',
    latitude: -5.791,
    longitude: -35.211,
    ...overrides,
  };
}

describe('mergeNearbyStores', () => {
  it('hides a Google place whose placeId is already registered', () => {
    const result = mergeNearbyStores(
      [store({ googlePlaceId: 'place-1' })],
      [place({ placeId: 'place-1' })],
      origin,
    );
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('store');
  });

  it('hides a Google place with the same name within 150 m even without placeId', () => {
    const result = mergeNearbyStores(
      [store({ googlePlaceId: undefined })],
      [place({ placeId: 'other', name: 'supermercado nordestao' })],
      origin,
    );
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('store');
  });

  it('keeps a Google place with the same name that is far away', () => {
    const result = mergeNearbyStores(
      [store({})],
      [place({ placeId: 'far', latitude: -5.85, longitude: -35.25 })],
      origin,
    );
    expect(result.map((o) => o.kind)).toEqual(['store', 'place']);
  });

  it('sorts registered stores and places together by distance', () => {
    const result = mergeNearbyStores(
      [store({ id: 'far-store', name: 'Loja Longe', latitude: -5.9, longitude: -35.3 })],
      [place({ placeId: 'near-place', name: 'Mercadinho Perto' })],
      origin,
    );
    expect(result.map((o) => o.key)).toEqual(['place:near-place', 'store:far-store']);
  });

  it('works with empty inputs', () => {
    expect(mergeNearbyStores(undefined, undefined, origin)).toEqual([]);
  });
});
