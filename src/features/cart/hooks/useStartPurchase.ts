import { useCallback } from 'react';
import { Alert } from 'react-native';
import { logger } from '@/shared/utils/logger';
import { ActivePurchaseConflictError, useCartStore, type LinkedListInput } from '../stores/cartStore';

interface StartPurchaseArgs {
  storeId: string;
  storeName: string;
  linkedList?: LinkedListInput | null;
}

/**
 * Inicia uma sessão de compra tratando o caso de já existir uma compra aberta
 * na API (ela é retomada e o usuário é avisado). Devolve `true` quando há uma
 * sessão ativa ao final (nova ou retomada) e o chamador pode ir para o carrinho.
 */
export function useStartPurchase() {
  const startSession = useCartStore((s) => s.startSession);
  const isStarting = useCartStore((s) => s.isStarting);

  const start = useCallback(
    async ({ storeId, storeName, linkedList }: StartPurchaseArgs): Promise<boolean> => {
      logger.info('Cart', 'Starting purchase', storeId, linkedList?.id);
      try {
        await startSession(storeId, storeName, linkedList);
        return true;
      } catch (error) {
        if (error instanceof ActivePurchaseConflictError) {
          const resumed = useCartStore.getState();
          if (resumed.isActive) {
            Alert.alert(
              'Compra em andamento',
              `Você já tinha uma compra aberta em ${resumed.storeName ?? 'outro supermercado'}. Ela foi retomada; finalize ou cancele para começar outra.`,
            );
            return true;
          }
        }
        logger.error('Cart', 'Failed to start session', error);
        Alert.alert('Erro', 'Não foi possível iniciar a compra. Tente novamente.');
        return false;
      }
    },
    [startSession],
  );

  return { start, isStarting };
}
