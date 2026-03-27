import { api } from '@/config/api';
import type { IPriceRepository } from '../interfaces/IPriceRepository';
import type {
  PriceEntry,
  CreatePriceEntry,
  PriceQueryParams,
  PriceComparison,
  PriceHistoryPoint,
} from '@/features/prices/types';
import type { Paginated } from '@/shared/types';

export class ApiPriceRepository implements IPriceRepository {
  async getByProduct(
    productId: string,
    params?: PriceQueryParams,
  ): Promise<Paginated<PriceEntry>> {
    const { data } = await api.get(`/products/${productId}/prices`, { params });
    return data;
  }

  async getComparison(productId: string): Promise<PriceComparison> {
    const { data } = await api.get(`/products/${productId}/prices/comparison`);
    return data;
  }

  async getHistory(
    productId: string,
    storeId?: string,
  ): Promise<PriceHistoryPoint[]> {
    const { data } = await api.get(`/products/${productId}/prices/history`, {
      params: storeId ? { storeId } : undefined,
    });
    return data;
  }

  async submit(entry: CreatePriceEntry): Promise<PriceEntry> {
    const { data } = await api.post(`/products/${entry.productId}/prices`, {
      storeId: entry.storeId,
      price: entry.price,
    });
    return data;
  }

  async validate(priceId: string, isValid: boolean): Promise<void> {
    await api.post(`/prices/${priceId}/validate`, { isValid });
  }
}
