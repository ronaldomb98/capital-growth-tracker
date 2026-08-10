import { describe, expect, it } from 'vitest';
import { aggregateProjections } from '../lib/aggregate';
import type { ProjectionRow } from '../lib/calc';

const rows: ProjectionRow[] = [{
  period: 1,
  date: '2026-01-29',
  initialCapital: 1000,
  periodProfit: 100,
  accumulatedCapital: 1100
}, {
  period: 2,
  date: '2026-01-30',
  initialCapital: 1100,
  periodProfit: 110,
  accumulatedCapital: 1210
}, {
  period: 3,
  date: '2026-02-02',
  initialCapital: 1210,
  periodProfit: 121,
  accumulatedCapital: 1331
}];

describe('aggregateProjections', () => {
  it('groups daily projections by calendar month', () => {
    const summaries = aggregateProjections(rows, 'months');

    expect(summaries).toMatchObject([{
      label: '2026-01',
      initialCapital: 1000,
      periodProfit: 210,
      accumulatedCapital: 1210
    }, {
      label: '2026-02',
      initialCapital: 1210,
      periodProfit: 121,
      accumulatedCapital: 1331
    }]);
    expect(summaries[0].cumulativeProfitPercent).toBeCloseTo(21);
    expect(summaries[1].cumulativeProfitPercent).toBeCloseTo(33.1);
  });

  it('uses ISO weeks, including week-year boundaries', () => {
    const summaries = aggregateProjections(rows, 'weeks');

    expect(summaries.map((row) => row.label)).toEqual(['2026-W05', '2026-W06']);
  });

  it('preserves a separate row for each trading day', () => {
    expect(aggregateProjections(rows, 'days')).toHaveLength(3);
  });
});
