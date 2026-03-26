import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { ShareResult, ShareRole } from '../types';

export function useShareByEmail() {
  const queryClient = useQueryClient();

  return useMutation<
    ShareResult,
    Error,
    { listId: string; email: string; role: ShareRole }
  >({
    mutationFn: ({ listId, email, role }) =>
      listRepository.shareByEmail(listId, email, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-members', variables.listId] });
    },
  });
}

export function useGenerateInvite() {
  return useMutation<
    ShareResult,
    Error,
    { listId: string; role: ShareRole }
  >({
    mutationFn: ({ listId, role }) =>
      listRepository.generateInvite(listId, role),
  });
}

export function useJoinByInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => listRepository.joinByInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { listId: string; userId: string }
  >({
    mutationFn: ({ listId, userId }) =>
      listRepository.removeMember(listId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-members', variables.listId] });
    },
  });
}
