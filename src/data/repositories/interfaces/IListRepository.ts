import type {
  ShoppingList,
  ListItem,
  CreateShoppingList,
  UpdateShoppingList,
  CreateListItem,
  UpdateListItem,
  OptimizationResult,
  SharedMember,
  ShareInvite,
  ShareResult,
  ShareByEmailResult,
  ShareRole,
} from '@/features/lists/types';

export interface IListRepository {
  getAll(): Promise<ShoppingList[]>;
  getById(id: string): Promise<ShoppingList | null>;
  create(list: CreateShoppingList): Promise<ShoppingList>;
  update(id: string, data: UpdateShoppingList): Promise<ShoppingList>;
  delete(id: string): Promise<void>;
  addItem(listId: string, item: CreateListItem): Promise<ListItem>;
  removeItem(listId: string, itemId: string): Promise<void>;
  updateItem(
    listId: string,
    itemId: string,
    data: UpdateListItem,
  ): Promise<ListItem>;
  optimize(listId: string): Promise<OptimizationResult>;

  // Sharing
  getMembers(listId: string): Promise<SharedMember[]>;
  shareByEmail(listId: string, email: string, role: ShareRole): Promise<ShareByEmailResult>;
  generateInvite(listId: string, role: ShareRole): Promise<ShareResult>;
  joinByInvite(inviteId: string): Promise<ShoppingList>;
  removeMember(listId: string, userId: string): Promise<void>;
  getInvite(inviteId: string): Promise<ShareInvite | null>;
}
