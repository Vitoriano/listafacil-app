import { ApiUserRepository } from './api/ApiUserRepository';
import { ApiProductRepository } from './api/ApiProductRepository';
import { ApiCategoryRepository } from './api/ApiCategoryRepository';
import { ApiPriceRepository } from './api/ApiPriceRepository';
import { ApiStoreRepository } from './api/ApiStoreRepository';
import { ApiListRepository } from './api/ApiListRepository';
import { ApiPurchaseRepository } from './api/ApiPurchaseRepository';
import type { IUserRepository } from './interfaces/IUserRepository';
import type { IProductRepository } from './interfaces/IProductRepository';
import type { ICategoryRepository } from './interfaces/ICategoryRepository';
import type { IPriceRepository } from './interfaces/IPriceRepository';
import type { IListRepository } from './interfaces/IListRepository';
import type { IStoreRepository } from './interfaces/IStoreRepository';
import type { IPurchaseRepository } from './interfaces/IPurchaseRepository';

// Singleton instances — all using real API repositories
export const userRepository: IUserRepository = new ApiUserRepository();
export const productRepository: IProductRepository = new ApiProductRepository();
export const categoryRepository: ICategoryRepository = new ApiCategoryRepository();
export const priceRepository: IPriceRepository = new ApiPriceRepository();
export const storeRepository: IStoreRepository = new ApiStoreRepository();
export const listRepository: IListRepository = new ApiListRepository();
export const purchaseRepository: IPurchaseRepository = new ApiPurchaseRepository();
