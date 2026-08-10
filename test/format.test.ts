import { describe, expect, it } from 'vitest';
import { formatCurrency, formatPercent } from '../lib/format';

describe('formatCurrency', () => {
  it('formats US dollars with a USD suffix', () => {
    expect(formatCurrency(1000)).toBe('1,000.00 USD');
  });

  it('uses a consistent format independent of locale', () => {
    expect(formatCurrency(1000.5)).toBe('1,000.50 USD');
  });

  it('formats cumulative profit percentages', () => {
    expect(formatPercent(12.5)).toBe('12.50%');
  });
});
