import { registerSchema } from '@/features/auth/schemas/registerSchema';

describe('registerSchema', () => {
  const validData = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('accepts valid name, email, password, confirmPassword when passwords match', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts minimum valid name (2 characters)', () => {
    const result = registerSchema.safeParse({ ...validData, name: 'AB' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...validData, name: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) =>
        i.path.includes('name'),
      );
      expect(nameError?.message).toBe('Name must be at least 2 characters');
    }
  });

  it('rejects invalid email format', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) =>
        i.path.includes('email'),
      );
      expect(emailError?.message).toBe('Invalid email');
    }
  });

  it('rejects password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'abc',
      confirmPassword: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find((i) =>
        i.path.includes('password'),
      );
      expect(passwordError?.message).toBe(
        'Password must be at least 6 characters',
      );
    }
  });

  it('rejects mismatched password and confirmPassword with "Passwords do not match" error on confirmPassword path', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password123',
      confirmPassword: 'differentpassword',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) =>
        i.path.includes('confirmPassword'),
      );
      expect(confirmError?.message).toBe('Passwords do not match');
    }
  });

  it('rejects missing name field', () => {
    const { name: _name, ...rest } = validData;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing email field', () => {
    const { email: _email, ...rest } = validData;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
