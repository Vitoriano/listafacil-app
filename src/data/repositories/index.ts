import { MockProductRepository } from './mock/MockProductRepository';
import { MockPriceRepository } from './mock/MockPriceRepository';
import { MockListRepository } from './mock/MockListRepository';
import { MockUserRepository } from './mock/MockUserRepository';
import { MockStoreRepository } from './mock/MockStoreRepository';
import { MockPurchaseRepository } from './mock/MockPurchaseRepository';
import type { IProductRepository } from './interfaces/IProductRepository';
import type { IPriceRepository } from './interfaces/IPriceRepository';
import type { IListRepository } from './interfaces/IListRepository';
import type { IUserRepository } from './interfaces/IUserRepository';
import type { IStoreRepository } from './interfaces/IStoreRepository';
import type { IPurchaseRepository } from './interfaces/IPurchaseRepository';

// Singleton instances — swap to Api*Repository for backend integration
export const productRepository: IProductRepository = new MockProductRepository();
export const priceRepository: IPriceRepository = new MockPriceRepository();
export const listRepository: IListRepository = new MockListRepository();
export const userRepository: IUserRepository = new MockUserRepository();
export const storeRepository: IStoreRepository = new MockStoreRepository();
export const purchaseRepository: IPurchaseRepository = new MockPurchaseRepository();
