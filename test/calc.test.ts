import { describe, expect, it } from 'vitest';
import { computeProjections } from '../lib/calc';

describe('computeProjections', () => {
  it('compounds each trading day from the prior accumulated capital', () => {
    const rows = computeProjections({
      principal: 1000,
      dailyRatePercent: 10,
      tradingDays: 3,
      startDate: '2026-01-02'
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      period: 1,
      date: '2026-01-02',
      initialCapital: 1000,
      periodProfit: 100,
      accumulatedCapital: 1100
    });
    expect(rows.map((row) => row.date)).toEqual([
      '2026-01-02',
      '2026-01-05',
      '2026-01-06'
    ]);
    expect(rows.map((row) => row.accumulatedCapital)).toEqual([1100, 1210, 1331]);
    expect(rows[1].initialCapital).toBe(rows[0].accumulatedCapital);
  });

  it('returns no rows for zero or negative trading days', () => {
    expect(computeProjections({
      principal: 1000,
      dailyRatePercent: 5,
      tradingDays: 0
    })).toEqual([]);
    expect(computeProjections({
      principal: 1000,
      dailyRatePercent: 5,
      tradingDays: -4
    })).toEqual([]);
  });

  it('preserves capital when the rate is zero', () => {
    const rows = computeProjections({
      principal: 1000,
      dailyRatePercent: 0,
      tradingDays: 3,
      startDate: '2026-01-02'
    });

    expect(rows.every((row) => row.periodProfit === 0)).toBe(true);
    expect(rows.every((row) => row.accumulatedCapital === 1000)).toBe(true);
  });

  it('floors fractional days and caps projections at 4000 trading days', () => {
    expect(computeProjections({
      principal: 100,
      dailyRatePercent: 1,
      tradingDays: 3.9
    })).toHaveLength(3);
    expect(computeProjections({
      principal: 100,
      dailyRatePercent: 1,
      tradingDays: 5000
    })).toHaveLength(4000);
  });
});
