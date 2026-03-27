import { api } from '@/config/api';
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
  ShareRole,
} from '@/features/lists/types';

export class ApiListRepository implements IListRepository {
  // ── CRUD ──

  async getAll(): Promise<ShoppingList[]> {
    const { data } = await api.get('/lists');
    return data;
  }

  async getById(id: string): Promise<ShoppingList | null> {
    try {
      const { data } = await api.get(`/lists/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async create(list: CreateShoppingList): Promise<ShoppingList> {
    const { data } = await api.post('/lists', list);
    return data;
  }

  async update(id: string, updateData: UpdateShoppingList): Promise<ShoppingList> {
    const { data } = await api.patch(`/lists/${id}`, updateData);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/lists/${id}`);
  }

  // ── Items ──

  async addItem(listId: string, item: CreateListItem): Promise<ListItem> {
    const { data } = await api.post(`/lists/${listId}/items`, item);
    return data;
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
    return data;
  }

  // ── Optimization ──

  async optimize(listId: string): Promise<OptimizationResult> {
    const { data } = await api.get(`/lists/${listId}/optimize`);
    return data;
  }

  // ── Sharing ──

  async getMembers(listId: string): Promise<SharedMember[]> {
    const { data } = await api.get(`/lists/${listId}/members`);
    return data;
  }

  async shareByEmail(
    listId: string,
    email: string,
    role: ShareRole,
  ): Promise<ShareResult> {
    const { data } = await api.post(`/lists/${listId}/share/email`, {
      email,
      role,
    });
    return data;
  }

  async generateInvite(
    listId: string,
    role: ShareRole,
  ): Promise<ShareResult> {
    const { data } = await api.post(`/lists/${listId}/share/invite`, { role });
    return data;
  }

  async joinByInvite(inviteId: string): Promise<ShoppingList> {
    const { data } = await api.post(`/invites/${inviteId}/join`);
    return data;
  }

  async removeMember(listId: string, userId: string): Promise<void> {
    await api.delete(`/lists/${listId}/members/${userId}`);
  }

  async getInvite(inviteId: string): Promise<ShareInvite | null> {
    try {
      const { data } = await api.get(`/invites/${inviteId}`);
      return data;
    } catch {
      return null;
    }
  }
}
