import { formatDate } from '@/shared/utils/formatDate';

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO 8601 input', () => {
    const result = formatDate('2025-09-19T10:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a formatted date string with day/month/year for a valid input', () => {
    const result = formatDate('2025-09-19T10:00:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('handles empty string without throwing', () => {
    expect(() => formatDate('')).not.toThrow();
    expect(formatDate('')).toBe('');
  });

  it('handles invalid date string without throwing', () => {
    expect(() => formatDate('not-a-date')).not.toThrow();
    expect(formatDate('not-a-date')).toBe('');
  });

  it('handles a date-only ISO 8601 string', () => {
    const result = formatDate('2025-01-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
