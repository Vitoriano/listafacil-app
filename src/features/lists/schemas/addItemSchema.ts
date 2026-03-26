import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddItemFormData = z.infer<typeof addItemSchema>;
