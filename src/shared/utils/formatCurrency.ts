import { CURRENCY, LOCALE } from '@/config/constants';

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return formatter.format(0);
  }
  return formatter.format(value);
}
