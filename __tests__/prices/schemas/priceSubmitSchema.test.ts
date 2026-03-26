import { priceSubmitSchema } from '@/features/prices/schemas/priceSubmitSchema';

describe('priceSubmitSchema', () => {
  it('valid data with positive price passes validation', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: 19.99,
    });
    expect(result.success).toBe(true);
  });

  it('price of 0 is rejected with appropriate error message', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const priceError = result.error.issues.find((i) => i.path.includes('price'));
      expect(priceError).toBeDefined();
    }
  });

  it('negative price is rejected', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: -5.0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const priceError = result.error.issues.find((i) => i.path.includes('price'));
      expect(priceError?.message).toMatch(/positive/i);
    }
  });

  it('price exceeding max (99999.99) is rejected', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: 100000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const priceError = result.error.issues.find((i) => i.path.includes('price'));
      expect(priceError?.message).toMatch(/maximum/i);
    }
  });

  it('missing productId is rejected with required field error', () => {
    const result = priceSubmitSchema.safeParse({
      productId: '',
      storeId: 'store-001',
      price: 19.99,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const productIdError = result.error.issues.find((i) =>
        i.path.includes('productId'),
      );
      expect(productIdError).toBeDefined();
    }
  });

  it('missing storeId is rejected with required field error', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: '',
      price: 19.99,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const storeIdError = result.error.issues.find((i) =>
        i.path.includes('storeId'),
      );
      expect(storeIdError).toBeDefined();
    }
  });

  it('price at maximum boundary (99999.99) passes', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: 99999.99,
    });
    expect(result.success).toBe(true);
  });

  it('price at minimum (0.01) passes', () => {
    const result = priceSubmitSchema.safeParse({
      productId: 'prod-001',
      storeId: 'store-001',
      price: 0.01,
    });
    expect(result.success).toBe(true);
  });
});
