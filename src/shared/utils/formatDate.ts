import { LOCALE } from '@/config/constants';

export function formatDate(isoString: string): string {
  if (!isoString) {
    return '';
  }

  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}
