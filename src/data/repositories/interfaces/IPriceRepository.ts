import type {
  PriceEntry,
  CreatePriceEntry,
  PriceQueryParams,
  PriceComparison,
  PriceHistoryPoint,
} from '@/features/prices/types';
import type { Paginated } from '@/shared/types';

export interface IPriceRepository {
  getByProduct(
    productId: string,
    params?: PriceQueryParams,
  ): Promise<Paginated<PriceEntry>>;
  getComparison(productId: string): Promise<PriceComparison>;
  getHistory(productId: string, storeId?: string): Promise<PriceHistoryPoint[]>;
  submit(entry: CreatePriceEntry): Promise<PriceEntry>;
  validate(priceId: string, isValid: boolean): Promise<void>;
}
