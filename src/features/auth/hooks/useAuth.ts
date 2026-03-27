import { useMutation } from '@tanstack/react-query';
import { userRepository } from '@/data/repositories';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { LoginCredentials, RegisterData } from '@/features/auth/types';

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      userRepository.login(credentials),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => userRepository.register(data),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
  };
}
