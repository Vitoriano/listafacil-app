export type ProductCategory =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'beverages'
  | 'cleaning'
  | 'hygiene'
  | 'snacks'
  | 'grains'
  | 'frozen'
  | 'other';

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: ProductCategory;
  unit: string;
  imageUrl: string | null;
  averagePrice: number;
  lowestPrice: number;
  priceCount: number;
  createdAt: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: ProductCategory;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'recent';
}
