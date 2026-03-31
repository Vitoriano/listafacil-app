import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/config/socket';
import { logger } from '@/shared/utils/logger';

export function useUserSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function invalidateLists() {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleListInvited(data: { listId: string }) {
      logger.info('Socket', 'list:invited', data.listId);
      invalidateLists();
    }

    function handleListRemoved(data: { listId: string }) {
      logger.info('Socket', 'list:removed', data.listId);
      invalidateLists();
      queryClient.removeQueries({ queryKey: ['lists', data.listId] });
    }

    function handleListUpdated() {
      logger.info('Socket', 'list:updated (global)');
      invalidateLists();
    }

    function handleItemChanged() {
      logger.info('Socket', 'list:item changed (global)');
      invalidateLists();
    }

    function handleMemberChanged() {
      logger.info('Socket', 'list:member changed (global)');
      invalidateLists();
    }

    socketService.on('list:invited', handleListInvited);
    socketService.on('list:removed', handleListRemoved);
    socketService.on('list:updated', handleListUpdated);
    socketService.on('list:item:added', handleItemChanged);
    socketService.on('list:item:updated', handleItemChanged);
    socketService.on('list:item:removed', handleItemChanged);
    socketService.on('list:member:joined', handleMemberChanged);
    socketService.on('list:member:removed', handleMemberChanged);

    return () => {
      socketService.off('list:invited', handleListInvited);
      socketService.off('list:removed', handleListRemoved);
      socketService.off('list:updated', handleListUpdated);
      socketService.off('list:item:added', handleItemChanged);
      socketService.off('list:item:updated', handleItemChanged);
      socketService.off('list:item:removed', handleItemChanged);
      socketService.off('list:member:joined', handleMemberChanged);
      socketService.off('list:member:removed', handleMemberChanged);
    };
  }, [queryClient]);
}
