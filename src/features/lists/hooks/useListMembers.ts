import { useQuery } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { SharedMember } from '../types';

export function useListMembers(listId: string | null) {
  return useQuery<SharedMember[]>({
    queryKey: ['list-members', listId],
    queryFn: () => listRepository.getMembers(listId!),
    enabled: !!listId,
  });
}
