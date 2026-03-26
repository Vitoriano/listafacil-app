import { useQuery } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { OptimizationResult } from '@/features/lists/types';

export function useOptimize(listId: string | null) {
  return useQuery<OptimizationResult>({
    queryKey: ['lists', listId, 'optimize'],
    queryFn: () => listRepository.optimize(listId!),
    enabled: !!listId,
  });
}
