import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/config/socket';
import { useCartStore } from '../stores/cartStore';
import { logger } from '@/shared/utils/logger';

export function usePurchaseSocket(purchaseId: string | null) {
  const queryClient = useQueryClient();
  const reset = useCartStore((s) => s.reset);

  useEffect(() => {
    if (!purchaseId) return;

    socketService.joinPurchase(purchaseId);
    logger.info('Socket', 'Joined purchase room', purchaseId);

    function invalidatePurchase() {
      queryClient.invalidateQueries({ queryKey: ['purchases', purchaseId] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    }

    function handleStatusUpdated(data: { id: string; status: string }) {
      logger.info('Socket', 'purchase:status:updated', data);
      invalidatePurchase();
      if (data.status === 'completed' || data.status === 'cancelled') {
        reset();
      }
    }

    function handleItemAdded() {
      logger.info('Socket', 'purchase:item:added', purchaseId);
      invalidatePurchase();
    }

    function handleItemUpdated() {
      logger.info('Socket', 'purchase:item:updated', purchaseId);
      invalidatePurchase();
    }

    function handleItemRemoved() {
      logger.info('Socket', 'purchase:item:removed', purchaseId);
      invalidatePurchase();
    }

    socketService.on('purchase:status:updated', handleStatusUpdated);
    socketService.on('purchase:item:added', handleItemAdded);
    socketService.on('purchase:item:updated', handleItemUpdated);
    socketService.on('purchase:item:removed', handleItemRemoved);

    return () => {
      socketService.off('purchase:status:updated', handleStatusUpdated);
      socketService.off('purchase:item:added', handleItemAdded);
      socketService.off('purchase:item:updated', handleItemUpdated);
      socketService.off('purchase:item:removed', handleItemRemoved);
      socketService.leavePurchase(purchaseId);
      logger.info('Socket', 'Left purchase room', purchaseId);
    };
  }, [purchaseId, queryClient, reset]);
}
