import { useQuery } from '@tanstack/react-query';
import { userRepository } from '@/data/repositories';
import type { User } from '@/features/auth/types';

export function useProfile() {
  return useQuery<User | null>({
    queryKey: ['user', 'current'],
    queryFn: () => userRepository.getCurrentUser(),
  });
}
