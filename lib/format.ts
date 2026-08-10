import type { Locale } from '../app/providers';

const locales = {
  en: 'en-US',
  es: 'es-ES'
} as const;

export function formatCurrency(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locales[locale], {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}
