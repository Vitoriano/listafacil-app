import { api } from '@/config/api';
import type { IPurchaseRepository } from '../interfaces/IPurchaseRepository';
import type {
  Purchase,
  PurchaseItem,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  AddPurchaseItemPayload,
  UpdatePurchaseItemPayload,
} from '@/features/cart/types';

export class ApiPurchaseRepository implements IPurchaseRepository {
  async getAll(): Promise<Purchase[]> {
    const { data } = await api.get('/purchases', {
      params: { limit: 50 },
    });
    return Array.isArray(data) ? data : data.data ?? data;
  }

  async getById(id: string): Promise<Purchase | null> {
    try {
      const { data } = await api.get(`/purchases/${id}`);
      return data;
    } catch {
      return null;
    }
  }

  async create(payload: CreatePurchasePayload): Promise<Purchase> {
    const { data } = await api.post('/purchases', payload);
    return data;
  }

  async update(
    id: string,
    payload: UpdatePurchasePayload,
  ): Promise<Purchase | null> {
    try {
      const { data } = await api.patch(`/purchases/${id}`, payload);
      return data;
    } catch {
      return null;
    }
  }

  async getRecent(limit: number = 5): Promise<Purchase[]> {
    const { data } = await api.get('/purchases/recent', {
      params: { limit },
    });
    return data;
  }

  async addItem(
    purchaseId: string,
    item: AddPurchaseItemPayload,
  ): Promise<PurchaseItem> {
    const { data } = await api.post(`/purchases/${purchaseId}/items`, item);
    return data;
  }

  async updateItem(
    purchaseId: string,
    itemId: string,
    updateData: UpdatePurchaseItemPayload,
  ): Promise<PurchaseItem> {
    const { data } = await api.patch(
      `/purchases/${purchaseId}/items/${itemId}`,
      updateData,
    );
    return data;
  }

  async removeItem(purchaseId: string, itemId: string): Promise<void> {
    await api.delete(`/purchases/${purchaseId}/items/${itemId}`);
  }
}
