import { createListSchema } from '@/features/lists/schemas/createListSchema';

describe('createListSchema', () => {
  it('accepts valid name (1 character)', () => {
    const result = createListSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(true);
  });

  it('accepts valid name (100 characters)', () => {
    const result = createListSchema.safeParse({ name: 'A'.repeat(100) });
    expect(result.success).toBe(true);
  });

  it('accepts valid name with normal text', () => {
    const result = createListSchema.safeParse({ name: 'Weekly Groceries' });
    expect(result.success).toBe(true);
  });

  it('rejects empty string with "List name is required" error', () => {
    const result = createListSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError?.message).toBe('List name is required');
    }
  });

  it('rejects string over 100 characters with "Name too long" error', () => {
    const result = createListSchema.safeParse({ name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError?.message).toBe('Name too long');
    }
  });

  it('rejects missing name field', () => {
    const result = createListSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
