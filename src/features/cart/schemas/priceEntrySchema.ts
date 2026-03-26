import { z } from 'zod';
import { PRICE_MAX } from '@/config/constants';

export const priceEntrySchema = z.object({
  price: z
    .number({ required_error: 'Informe o preco' })
    .positive('Preco deve ser positivo')
    .max(PRICE_MAX, 'Preco excede o maximo'),
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade minima e 1')
    .max(999, 'Quantidade maxima e 999'),
});

export type PriceEntryFormData = z.infer<typeof priceEntrySchema>;
