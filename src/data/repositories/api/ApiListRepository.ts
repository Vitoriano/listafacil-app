import { api } from '@/config/api';
import {
  mapShareInviteFromApi,
  mapShareResultFromApi,
} from '@/lib/mapShareFromApi';
import type { IListRepository } from '../interfaces/IListRepository';
import type {
  ShoppingList,
  ListItem,
  CreateShoppingList,
  UpdateShoppingList,
  CreateListItem,
  UpdateListItem,
  OptimizationResult,
  SharedMember,
  ShareInvite,
  ShareResult,
  ShareByEmailResult,
  ShareRole,
} from '@/features/lists/types';

/**
 * API item shape:
 * { id, listId, productId, quantity, estimatedPrice, checked,
 *   product: { id, name, brand, barcode, unit, imageUrl, ... } }
 */
function mapListItemFromApi(raw: Record<string, unknown>): ListItem {
  const product = raw.product as Record<string, unknown> | undefined;

  return {
    id: String(raw.id ?? ''),
    productId: String(raw.productId ?? product?.id ?? ''),
    productName: String(raw.productName ?? product?.name ?? 'Produto'),
    quantity: Number(raw.quantity) || 1,
    unit: String(raw.unit ?? product?.unit ?? 'un'),
    estimatedPrice: parseFloat(String(raw.estimatedPrice ?? 0)) || 0,
    checked: Boolean(raw.checked),
  };
}

/**
 * API list shape:
 * GET /lists:    { id, name, ownerId, createdAt, updatedAt, _count: { items, members }, estimatedTotal: 245.8 }
 * GET /lists/id: { id, name, ownerId, createdAt, updatedAt, owner, members, items: [{ id, listId, productId, quantity, estimatedPrice: "25.90", checked, createdAt, product: {...} }] }
 */
function mapShoppingListFromApi(raw: Record<string, unknown>): ShoppingList {
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((r) => mapListItemFromApi(r as Record<string, unknown>));
  const count = raw._count as Record<string, unknown> | undefined;
  const calculatedTotal = items.reduce((sum, i) => sum + i.estimatedPrice * i.quantity, 0);
  const apiTotal = raw.estimatedTotal != null
    ? parseFloat(String(raw.estimatedTotal))
    : NaN;

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    items,
    totalEstimate: !Number.isNaN(apiTotal) ? apiTotal : calculatedTotal,
    itemCount: Number(count?.items ?? items.length) || 0,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
  };
}

function mapShoppingListArray(data: unknown): ShoppingList[] {
  const arr = Array.isArray(data)
    ? data
    : (data as Record<string, unknown>)?.data;
  if (!Array.isArray(arr)) return [];
  return arr.map((r) => mapShoppingListFromApi(r as Record<string, unknown>));
}

export class ApiListRepository implements IListRepository {
  // ── CRUD ──

  async getAll(): Promise<ShoppingList[]> {
    const { data } = await api.get('/lists');
    return mapShoppingListArray(data);
  }

  async getById(id: string): Promise<ShoppingList | null> {
    try {
      const { data } = await api.get(`/lists/${id}`);
      return mapShoppingListFromApi(data as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async create(list: CreateShoppingList): Promise<ShoppingList> {
    const { data } = await api.post('/lists', list);
    return mapShoppingListFromApi(data as Record<string, unknown>);
  }

  async update(id: string, updateData: UpdateShoppingList): Promise<ShoppingList> {
    const { data } = await api.patch(`/lists/${id}`, updateData);
    return mapShoppingListFromApi(data as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/lists/${id}`);
  }

  // ── Items ──

  async addItem(listId: string, item: CreateListItem): Promise<ListItem> {
    const { data } = await api.post(`/lists/${listId}/items`, item);
    return mapListItemFromApi(data as Record<string, unknown>);
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    await api.delete(`/lists/${listId}/items/${itemId}`);
  }

  async updateItem(
    listId: string,
    itemId: string,
    updateData: UpdateListItem,
  ): Promise<ListItem> {
    const { data } = await api.patch(
      `/lists/${listId}/items/${itemId}`,
      updateData,
    );
    return mapListItemFromApi(data as Record<string, unknown>);
  }

  // ── Optimization ──

  async optimize(listId: string): Promise<OptimizationResult> {
    const { data } = await api.get(`/lists/${listId}/optimize`);
    return data;
  }

  // ── Sharing ──

  async getMembers(listId: string): Promise<SharedMember[]> {
    const { data } = await api.get(`/lists/${listId}/members`);
    const raw = data as Record<string, unknown>;
    const members = Array.isArray(raw.members) ? raw.members : Array.isArray(raw) ? raw : [];
    return members.map((m: Record<string, unknown>) => ({
      userId: String(m.userId ?? m.user_id ?? ''),
      name: String(m.name ?? ''),
      email: String(m.email ?? ''),
      role: (m.role === 'viewer' ? 'viewer' : 'editor') as ShareRole,
      joinedAt: String(m.joinedAt ?? m.joined_at ?? ''),
    }));
  }

  async shareByEmail(
    listId: string,
    email: string,
    role: ShareRole,
  ): Promise<ShareByEmailResult> {
    const { data } = await api.post(`/lists/${listId}/share/email`, {
      email,
      role,
    });
    const raw = data as Record<string, unknown>;
    if (raw.joined === true) {
      return { joined: true, userId: String(raw.userId ?? '') };
    }
    return { joined: false, inviteId: String(raw.inviteId ?? raw.invite_id ?? '') };
  }

  async generateInvite(
    listId: string,
    role: ShareRole,
  ): Promise<ShareResult> {
    const { data } = await api.post(`/lists/${listId}/share/invite`, { role });
    return mapShareResultFromApi(data);
  }

  async joinByInvite(inviteId: string): Promise<ShoppingList> {
    const { data } = await api.post(`/invites/${inviteId}/join`);
    return mapShoppingListFromApi(data as Record<string, unknown>);
  }

  async removeMember(listId: string, userId: string): Promise<void> {
    await api.delete(`/lists/${listId}/members/${userId}`);
  }

  async getInvite(inviteId: string): Promise<ShareInvite | null> {
    try {
      const { data } = await api.get(`/invites/${inviteId}`);
      const raw = data as Record<string, unknown>;
      return mapShareInviteFromApi(raw.invite ?? raw);
    } catch {
      return null;
    }
  }
}
