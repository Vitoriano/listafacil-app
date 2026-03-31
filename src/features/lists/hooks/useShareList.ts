import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listRepository } from '@/data/repositories';
import type { ShareByEmailResult, ShareResult, ShareRole } from '../types';

export function useShareByEmail() {
  const queryClient = useQueryClient();

  return useMutation<
    ShareByEmailResult,
    Error,
    { listId: string; email: string; role: ShareRole }
  >({
    mutationFn: ({ listId, email, role }) =>
      listRepository.shareByEmail(listId, email, role),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-members', variables.listId] });
      if (result.joined) {
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      }
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
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
