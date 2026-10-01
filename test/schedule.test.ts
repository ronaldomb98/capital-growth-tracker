import { describe, expect, it } from 'vitest';
import { buildTradeSchedule, type ScheduleInput } from '../lib/schedule';

const input: ScheduleInput = {
  mode: 'dates', startDate: '2026-06-08', endDate: '2026-06-14',
  tradesPerWeek: 5, tradeCount: 5
};

describe('trade scheduling', () => {
  it('includes both endpoints and excludes weekends', () => {
    expect(buildTradeSchedule(input).dates).toEqual([
      '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12'
    ]);
    expect(buildTradeSchedule({ ...input, endDate: input.startDate }).dates).toEqual(['2026-06-08']);
    expect(buildTradeSchedule({ ...input, startDate: '2026-06-13' }).dates).toEqual([]);
  });

  it('spreads a small quota across sessions, and supports multiple trades per day', () => {
    expect(buildTradeSchedule({ ...input, tradesPerWeek: 2 }).dates).toEqual(['2026-06-08', '2026-06-10']);
    expect(buildTradeSchedule({ ...input, tradesPerWeek: 10 }).dates).toEqual([
      '2026-06-08', '2026-06-08', '2026-06-09', '2026-06-09', '2026-06-10',
      '2026-06-10', '2026-06-11', '2026-06-11', '2026-06-12', '2026-06-12'
    ]);
  });

  it('redistributes the weekly quota over holiday weeks and filters partial weeks', () => {
    expect(buildTradeSchedule({ ...input, startDate: '2026-06-15', endDate: '2026-06-21' }).dates).toEqual([
      '2026-06-15', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18'
    ]);
    expect(buildTradeSchedule({ ...input, startDate: '2026-06-10', endDate: '2026-06-17', tradesPerWeek: 2 }).dates).toEqual([
      '2026-06-10', '2026-06-15', '2026-06-17'
    ]);
  });

  it('calculates an exact count from a weekend start, across a holiday', () => {
    const result = buildTradeSchedule({ ...input, mode: 'trades', startDate: '2026-06-13', tradeCount: 6 });
    expect(result.dates).toHaveLength(6);
    expect(result.dates[0]).toBe('2026-06-15');
    expect(result.dates.at(-1)).toBe('2026-06-22');
    expect(buildTradeSchedule({ ...input, mode: 'trades', tradesPerWeek: 10, tradeCount: 3 }).dates).toEqual([
      '2026-06-08', '2026-06-08', '2026-06-09'
    ]);
  });

  it('uses the same schedule in both modes, including year boundaries', () => {
    const ranged = buildTradeSchedule({ ...input, startDate: '2026-12-28', endDate: '2027-01-08', tradesPerWeek: 3 });
    const counted = buildTradeSchedule({ ...input, mode: 'trades', startDate: '2026-12-28', tradeCount: ranged.dates.length, tradesPerWeek: 3 });
    expect(counted.dates).toEqual(ranged.dates);
  });

  it('handles leap days and daylight saving time as date-only values', () => {
    expect(buildTradeSchedule({ ...input, startDate: '2028-02-28', endDate: '2028-03-03' }).dates).toContain('2028-02-29');
    expect(buildTradeSchedule({ ...input, startDate: '2026-03-06', endDate: '2026-03-09' }).dates).toEqual(['2026-03-06', '2026-03-09']);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 101])('rejects invalid weekly frequency %s', (tradesPerWeek) => {
    expect(buildTradeSchedule({ ...input, tradesPerWeek }).error).toBe('weekly');
  });
  it.each([0, -1, 1.5, NaN, Infinity, 4001])('rejects invalid trade count %s', (tradeCount) => {
    expect(buildTradeSchedule({ ...input, mode: 'trades', tradeCount }).error).toBe('count');
  });
  it.each(['', '2026-02-30', '2026-13-01', '1999-12-31', '2101-01-01'])('rejects invalid dates %s', (startDate) => {
    expect(buildTradeSchedule({ ...input, startDate }).error).toBe('dates');
  });

  it('rejects reversed ranges and refuses to silently truncate long ranges', () => {
    expect(buildTradeSchedule({ ...input, endDate: '2026-06-07' }).error).toBe('dates');
    expect(buildTradeSchedule({ ...input, endDate: '2030-06-14', tradesPerWeek: 100 })).toEqual({ dates: [], error: 'limit' });
    expect(buildTradeSchedule({ ...input, mode: 'trades', startDate: '2100-12-31', tradeCount: 4000 }).error).toBe('horizon');
  });

  it('allows the maximum supported count without truncating', () => {
    expect(buildTradeSchedule({ ...input, mode: 'trades', tradeCount: 4000, tradesPerWeek: 100 }).dates).toHaveLength(4000);
  });
});
