import { addItemSchema } from '@/features/lists/schemas/addItemSchema';

describe('addItemSchema', () => {
  it('accepts valid productId and quantity >= 1', () => {
    const result = addItemSchema.safeParse({ productId: 'prod-001', quantity: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts quantity of 10', () => {
    const result = addItemSchema.safeParse({ productId: 'prod-001', quantity: 10 });
    expect(result.success).toBe(true);
  });

  it('rejects empty productId', () => {
    const result = addItemSchema.safeParse({ productId: '', quantity: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const productIdError = result.error.issues.find((i) =>
        i.path.includes('productId'),
      );
      expect(productIdError).toBeDefined();
      expect(productIdError?.message).toBe('Product is required');
    }
  });

  it('rejects quantity of 0', () => {
    const result = addItemSchema.safeParse({ productId: 'prod-001', quantity: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const quantityError = result.error.issues.find((i) =>
        i.path.includes('quantity'),
      );
      expect(quantityError).toBeDefined();
    }
  });

  it('rejects negative quantity', () => {
    const result = addItemSchema.safeParse({ productId: 'prod-001', quantity: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const quantityError = result.error.issues.find((i) =>
        i.path.includes('quantity'),
      );
      expect(quantityError).toBeDefined();
    }
  });

  it('rejects missing productId', () => {
    const result = addItemSchema.safeParse({ quantity: 2 });
    expect(result.success).toBe(false);
  });

  it('rejects missing quantity', () => {
    const result = addItemSchema.safeParse({ productId: 'prod-001' });
    expect(result.success).toBe(false);
  });
});
