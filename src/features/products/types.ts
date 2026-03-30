export interface Category {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface LatestPrice {
  id: string;
  price: number;
  storeId: string;
  submittedAt: string;
  store: { id: string; name: string };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  categoryId: number | null;
  subCategoryId: number | null;
  /** Nome da categoria resolvido pela API (ex: "Alimentos"). */
  categoryName: string | null;
  unit: string;
  /** URL https (REST Firebase ou da API), para fallback / leitura direta. */
  imageUrl: string | null;
  /** Chave bruta no Storage (ex. `uuid.webp`); usada com SDK `getDownloadURL`. */
  imageStorageKey?: string | null;
  latestPrice: LatestPrice | null;
  createdAt: string;
}

export interface ProductQueryParams {
  q?: string;
  categoryId?: number;
  subCategoryId?: number;
  page?: number;
  limit?: number;
}
