import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'Name too long'),
});

export type CreateListFormData = z.infer<typeof createListSchema>;
