import { formatCurrency } from '@/shared/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats 4.89 as BRL', () => {
    const result = formatCurrency(4.89);
    expect(result).toContain('4,89');
    expect(result).toContain('R$');
  });

  it('formats 1234.56 with thousands separator', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
    expect(result).toContain('R$');
  });

  it('formats 0', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });

  it('formats 0.01', () => {
    const result = formatCurrency(0.01);
    expect(result).toContain('0,01');
    expect(result).toContain('R$');
  });

  it('formats 99999.99', () => {
    const result = formatCurrency(99999.99);
    expect(result).toContain('99.999,99');
    expect(result).toContain('R$');
  });
});
