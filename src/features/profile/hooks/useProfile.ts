import { useQuery } from '@tanstack/react-query';
import { userRepository } from '@/data/repositories';
import type { UserWithStats } from '@/features/auth/types';

export function useProfile() {
  return useQuery<UserWithStats | null>({
    queryKey: ['user', 'current'],
    queryFn: () => userRepository.getCurrentUser(),
  });
}
