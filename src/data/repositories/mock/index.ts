/**
 * In-memory repositories backed by `src/data/seed/*.json`.
 *
 * Jest maps `@/data/repositories` to this module (see `jest.config.js`), so hooks and
 * screens are tested against deterministic seed data instead of the HTTP API.
 */
import { MockUserRepository } from './MockUserRepository';
import { MockProductRepository } from './MockProductRepository';
import { MockCategoryRepository } from './MockCategoryRepository';
import { MockPriceRepository } from './MockPriceRepository';
import { MockStoreRepository } from './MockStoreRepository';
import { MockListRepository } from './MockListRepository';
import { MockPurchaseRepository } from './MockPurchaseRepository';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type { IProductRepository } from '../interfaces/IProductRepository';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { IPriceRepository } from '../interfaces/IPriceRepository';
import type { IListRepository } from '../interfaces/IListRepository';
import type { IStoreRepository } from '../interfaces/IStoreRepository';
import type { IPurchaseRepository } from '../interfaces/IPurchaseRepository';

export const userRepository: IUserRepository = new MockUserRepository();
export const productRepository: IProductRepository = new MockProductRepository();
export const categoryRepository: ICategoryRepository = new MockCategoryRepository();
export const priceRepository: IPriceRepository = new MockPriceRepository();
export const storeRepository: IStoreRepository = new MockStoreRepository();
export const listRepository: IListRepository = new MockListRepository();
export const purchaseRepository: IPurchaseRepository = new MockPurchaseRepository();
