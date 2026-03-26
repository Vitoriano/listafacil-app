import { useQuery } from '@tanstack/react-query';
import { storeRepository } from '@/data/repositories';
import type { Store } from '@/shared/types';

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: () => storeRepository.getAll(),
  });
}
