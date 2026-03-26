import { loginSchema } from '@/features/auth/schemas/loginSchema';

describe('loginSchema', () => {
  it('accepts valid email and password (min 6 chars)', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimum valid password (6 characters)', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format with "Invalid email" error', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) =>
        i.path.includes('email'),
      );
      expect(emailError?.message).toBe('Invalid email');
    }
  });

  it('rejects password shorter than 6 characters with appropriate error', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'abc',
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

  it('rejects missing email field', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password field', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
