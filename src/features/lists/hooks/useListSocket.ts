import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { socketService } from '@/config/socket';
import { logger } from '@/shared/utils/logger';

export function useListSocket(listId: string | null) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!listId) return;

    socketService.joinList(listId);
    logger.info('Socket', 'Joined list room', listId);

    function invalidateList() {
      queryClient.invalidateQueries({ queryKey: ['lists', listId] });
    }

    function invalidateMembers() {
      queryClient.invalidateQueries({ queryKey: ['list-members', listId] });
    }

    function handleListUpdated() {
      logger.info('Socket', 'list:updated', listId);
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleListDeleted() {
      logger.info('Socket', 'list:deleted', listId);
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      router.back();
    }

    function handleItemAdded() {
      logger.info('Socket', 'list:item:added', listId);
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleItemUpdated() {
      logger.info('Socket', 'list:item:updated', listId);
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleItemRemoved() {
      logger.info('Socket', 'list:item:removed', listId);
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleMemberJoined() {
      logger.info('Socket', 'list:member:joined', listId);
      invalidateMembers();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    function handleMemberRemoved() {
      logger.info('Socket', 'list:member:removed', listId);
      invalidateMembers();
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    }

    // Eventos cruzados Lista ↔ Compra
    function handlePurchaseStarted() {
      logger.info('Socket', 'purchase:started (list room)', listId);
      invalidateList();
    }

    function handlePurchaseStatusUpdated() {
      logger.info('Socket', 'purchase:status:updated (list room)', listId);
      invalidateList();
    }

    function handlePurchaseItemAdded() {
      logger.info('Socket', 'purchase:item:added (list room)', listId);
      invalidateList();
    }

    socketService.on('list:updated', handleListUpdated);
    socketService.on('list:deleted', handleListDeleted);
    socketService.on('list:item:added', handleItemAdded);
    socketService.on('list:item:updated', handleItemUpdated);
    socketService.on('list:item:removed', handleItemRemoved);
    socketService.on('list:member:joined', handleMemberJoined);
    socketService.on('list:member:removed', handleMemberRemoved);
    socketService.on('purchase:started', handlePurchaseStarted);
    socketService.on('purchase:status:updated', handlePurchaseStatusUpdated);
    socketService.on('purchase:item:added', handlePurchaseItemAdded);

    return () => {
      socketService.off('list:updated', handleListUpdated);
      socketService.off('list:deleted', handleListDeleted);
      socketService.off('list:item:added', handleItemAdded);
      socketService.off('list:item:updated', handleItemUpdated);
      socketService.off('list:item:removed', handleItemRemoved);
      socketService.off('list:member:joined', handleMemberJoined);
      socketService.off('list:member:removed', handleMemberRemoved);
      socketService.off('purchase:started', handlePurchaseStarted);
      socketService.off('purchase:status:updated', handlePurchaseStatusUpdated);
      socketService.off('purchase:item:added', handlePurchaseItemAdded);
      socketService.leaveList(listId);
      logger.info('Socket', 'Left list room', listId);
    };
  }, [listId, queryClient, router]);
}
