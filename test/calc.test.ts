import { describe, expect, it } from 'vitest';
import { computeProjections } from '../lib/calc';
import { aggregateProjections } from '../lib/aggregate';

const tradeDates = ['2026-06-08', '2026-06-08', '2026-06-10'];

describe('computeProjections', () => {
  it('compounds every trade, including multiple trades on one date', () => {
    const rows = computeProjections({ principal: 1000, ratePercent: 10, tradeDates });
    expect(rows.map((row) => row.date)).toEqual(tradeDates);
    expect(rows.map((row) => row.accumulatedCapital)).toEqual([1100, 1210, 1331]);
    expect(rows[1].initialCapital).toBe(rows[0].accumulatedCapital);
    expect(aggregateProjections(rows, 'days')).toMatchObject([
      { label: '2026-06-08', initialCapital: 1000, periodProfit: 210, accumulatedCapital: 1210 },
      { label: '2026-06-10', initialCapital: 1210, periodProfit: 121, accumulatedCapital: 1331 }
    ]);
  });

  it('returns no rows without trades', () => {
    expect(computeProjections({ principal: 1000, ratePercent: 5, tradeDates: [] })).toEqual([]);
  });

  it('preserves capital when the rate is zero', () => {
    const rows = computeProjections({ principal: 1000, ratePercent: 0, tradeDates });
    expect(rows.every((row) => row.periodProfit === 0 && row.accumulatedCapital === 1000)).toBe(true);
  });

  it('does not send non-finite projections to the UI', () => {
    expect(computeProjections({ principal: NaN, ratePercent: 1, tradeDates })).toEqual([]);
    expect(computeProjections({ principal: 1000, ratePercent: Infinity, tradeDates })).toEqual([]);
    expect(computeProjections({ principal: 1000, ratePercent: 99, tradeDates: Array(4000).fill('2026-06-08') })).toEqual([]);
  });
});
