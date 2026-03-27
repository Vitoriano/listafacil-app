import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/stores/authStore';

export default function Index() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
