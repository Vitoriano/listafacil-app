import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/config/socket';
import { logger } from '@/shared/utils/logger';

export function useUserSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleListInvited(data: { listId: string }) {
      logger.info('Socket', 'list:invited', data.listId);
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleListRemoved(data: { listId: string }) {
      logger.info('Socket', 'list:removed', data.listId);
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.removeQueries({ queryKey: ['lists', data.listId] });
    }

    socketService.on('list:invited', handleListInvited);
    socketService.on('list:removed', handleListRemoved);

    return () => {
      socketService.off('list:invited', handleListInvited);
      socketService.off('list:removed', handleListRemoved);
    };
  }, [queryClient]);
}
