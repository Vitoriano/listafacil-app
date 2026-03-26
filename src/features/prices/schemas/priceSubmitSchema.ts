import { z } from 'zod';

export const priceSubmitSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  storeId: z.string().min(1, 'Store is required'),
  price: z
    .number()
    .positive('Price must be positive')
    .max(99999.99, 'Price exceeds maximum')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
});

export type PriceSubmitFormData = z.infer<typeof priceSubmitSchema>;
