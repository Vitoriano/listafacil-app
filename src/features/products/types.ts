export interface Category {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  categoryId: number | null;
  subCategoryId: number | null;
  unit: string;
  imageUrl: string | null;
  averagePrice: number;
  lowestPrice: number;
  priceCount: number;
  createdAt: string;
}

export interface ProductQueryParams {
  q?: string;
  categoryId?: number;
  subCategoryId?: number;
  page?: number;
  limit?: number;
}
