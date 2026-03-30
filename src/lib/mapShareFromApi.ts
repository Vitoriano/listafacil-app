import type { ShareInvite, ShareResult, ShareRole } from '@/features/lists/types';

function asRole(v: unknown): ShareRole {
  return v === 'viewer' ? 'viewer' : 'editor';
}

/**
 * Convite vindo da API (camelCase ou snake_case).
 */
export function mapShareInviteFromApi(raw: unknown): ShareInvite | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = o.id ?? o.invite_id;
  if (id == null || String(id).trim() === '') return null;
  return {
    id: String(id),
    listId: String(o.listId ?? o.list_id ?? ''),
    listName: String(o.listName ?? o.list_name ?? ''),
    invitedBy: String(o.invitedBy ?? o.invited_by ?? ''),
    role: asRole(o.role),
    createdAt: String(o.createdAt ?? o.created_at ?? ''),
    expiresAt: String(o.expiresAt ?? o.expires_at ?? ''),
  };
}

/**
 * Resultado de share/invite: garante `shareUrl` e convite com id (deep link compatível com o scanner).
 */
export function mapShareResultFromApi(data: unknown): ShareResult {
  if (data == null || typeof data !== 'object') {
    throw new Error('Resposta de convite invalida');
  }
  const d = data as Record<string, unknown>;

  let invite =
    mapShareInviteFromApi(d.invite) ?? mapShareInviteFromApi(d);

  if (!invite) {
    const onlyId = d.inviteId ?? d.invite_id;
    if (onlyId != null && String(onlyId).trim() !== '') {
      const id = String(onlyId).trim();
      invite = {
        id,
        listId: String(d.listId ?? d.list_id ?? ''),
        listName: String(d.listName ?? d.list_name ?? ''),
        invitedBy: String(d.invitedBy ?? d.invited_by ?? ''),
        role: asRole(d.role),
        createdAt: String(d.createdAt ?? d.created_at ?? ''),
        expiresAt: String(d.expiresAt ?? d.expires_at ?? ''),
      };
    }
  }

  if (!invite) {
    throw new Error('Convite sem id na resposta da API');
  }

  const shareUrlRaw = d.shareUrl ?? d.share_url;
  const trimmed =
    typeof shareUrlRaw === 'string' ? shareUrlRaw.trim() : '';
  const shareUrl =
    trimmed !== '' ? trimmed : `listafacil://join/${invite.id}`;

  return { invite, shareUrl };
}
