import { describe, expect, it } from 'vitest';
import { enumerateTradingDays, isTradingDay, nyseHolidays } from '../lib/tradingDays';

describe('NYSE trading calendar', () => {
  it('includes the standard observed NYSE holidays in 2026', () => {
    const holidays = nyseHolidays(2026);

    for (const holiday of [
      '2026-01-01',
      '2026-01-19',
      '2026-04-03',
      '2026-06-19',
      '2026-11-26',
      '2026-12-25'
    ]) {
      expect(holidays.has(holiday)).toBe(true);
    }
  });

  it('keeps the Friday before a Saturday New Year open', () => {
    expect(isTradingDay('2021-12-31')).toBe(true);
    expect(isTradingDay('2027-12-31')).toBe(true);
  });

  it('excludes weekends and market holidays', () => {
    expect(isTradingDay('2026-06-19')).toBe(false);
    expect(isTradingDay('2026-06-20')).toBe(false);
    expect(isTradingDay('2026-06-22')).toBe(true);
  });

  it('skips a market holiday while enumerating a requested number of days', () => {
    expect(enumerateTradingDays('2026-06-18', 3)).toEqual([
      '2026-06-18',
      '2026-06-22',
      '2026-06-23'
    ]);
  });
});
