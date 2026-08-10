import { describe, expect, it } from 'vitest';
import { sampleForChart } from '../lib/chart';
import type { ProjectionRow } from '../lib/calc';

function makeRows(length: number): ProjectionRow[] {
  return Array.from({ length }, (_, index) => ({
    period: index + 1,
    initialCapital: index,
    periodProfit: 1,
    accumulatedCapital: index + 1
  }));
}

describe('sampleForChart', () => {
  it('returns the original rows when they fit within the chart limit', () => {
    const rows = makeRows(250);

    expect(sampleForChart(rows)).toBe(rows);
  });

  it('limits long datasets while preserving the final period', () => {
    const rows = makeRows(1000);
    const sampledRows = sampleForChart(rows);

    expect(sampledRows.length).toBeLessThanOrEqual(251);
    expect(sampledRows.at(-1)).toBe(rows.at(-1));
  });
});
