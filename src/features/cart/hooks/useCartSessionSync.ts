import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useAppState } from '@/shared/hooks/useAppState';
import { useCartStore } from '../stores/cartStore';

/**
 * Mantém a sessão de compra alinhada com a API:
 * - ao autenticar, retoma uma compra que ficou em andamento (app fechado no meio da compra);
 * - ao voltar para o foreground, confere se ela ainda está ativa.
 */
export function useCartSessionSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const appState = useAppState();
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const reset = useCartStore((s) => s.reset);
  const lastSyncedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      lastSyncedUser.current = null;
      reset();
      return;
    }
    if (lastSyncedUser.current === userId) return;
    lastSyncedUser.current = userId;
    void syncFromServer();
  }, [userId, syncFromServer, reset]);

  useEffect(() => {
    if (appState === 'active' && userId && lastSyncedUser.current === userId) {
      void syncFromServer();
    }
    // Só reage à mudança de foreground; o efeito acima cuida do login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);
}
