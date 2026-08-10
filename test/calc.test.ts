import { describe, expect, it } from 'vitest';
import { computeProjections } from '../lib/calc';

describe('computeProjections', () => {
  it('compounds each period from the prior accumulated capital', () => {
    const rows = computeProjections({
      principal: 1000,
      ratePercent: 10,
      periods: 3
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      period: 1,
      initialCapital: 1000,
      periodProfit: 100,
      accumulatedCapital: 1100
    });
    expect(rows.map((row) => row.accumulatedCapital)).toEqual([1100, 1210, 1331]);
    expect(rows[1].initialCapital).toBe(rows[0].accumulatedCapital);
  });

  it('returns no rows for zero or negative durations', () => {
    expect(computeProjections({ principal: 1000, ratePercent: 5, periods: 0 })).toEqual([]);
    expect(computeProjections({ principal: 1000, ratePercent: 5, periods: -4 })).toEqual([]);
  });

  it('preserves capital when the rate is zero', () => {
    const rows = computeProjections({ principal: 1000, ratePercent: 0, periods: 3 });

    expect(rows.every((row) => row.periodProfit === 0)).toBe(true);
    expect(rows.every((row) => row.accumulatedCapital === 1000)).toBe(true);
  });

  it('floors fractional durations and caps projections at 1000 periods', () => {
    expect(computeProjections({ principal: 100, ratePercent: 1, periods: 3.9 })).toHaveLength(3);
    expect(computeProjections({ principal: 100, ratePercent: 1, periods: 5000 })).toHaveLength(1000);
  });
});
