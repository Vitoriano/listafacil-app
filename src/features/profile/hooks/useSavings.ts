import { useQuery } from '@tanstack/react-query';
import { userRepository } from '@/data/repositories';
import type { SavingsData } from '@/features/auth/types';

export function useSavings() {
  return useQuery<SavingsData>({
    queryKey: ['user', 'savings'],
    queryFn: () => userRepository.getSavings(),
  });
}
