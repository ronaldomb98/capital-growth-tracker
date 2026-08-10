import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../lib/format';

describe('formatCurrency', () => {
  it('formats US dollars in English', () => {
    expect(formatCurrency(1000, 'en')).toBe('$1,000.00');
  });

  it('uses Spanish number separators', () => {
    const formatted = formatCurrency(1000.5, 'es');

    expect(formatted).toContain(',50');
  });
});
