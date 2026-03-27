import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { socketService } from '@/config/socket';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [accessToken]);
}
