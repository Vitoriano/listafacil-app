export interface PriceEntry {
  id: string;
  productId: string;
  storeId: string;
  storeName: string;
  price: number;
  userId: string;
  submittedAt: string;
  validations: number;
  isValid: boolean;
}

export interface CreatePriceEntry {
  productId: string;
  storeId: string;
  price: number;
}

export interface PriceQueryParams {
  page?: number;
  limit?: number;
}

export interface PriceComparison {
  productId: string;
  productName: string;
  entries: PriceEntry[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  storeCount: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  storeId: string;
  storeName: string;
}
