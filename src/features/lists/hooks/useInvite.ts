import { useQuery } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { ShareInvite } from '../types';

export function useInvite(inviteId: string | null) {
  return useQuery<ShareInvite | null>({
    queryKey: ['invite', inviteId],
    queryFn: () => listRepository.getInvite(inviteId!),
    enabled: !!inviteId,
  });
}
