import type { ProjectionRow } from './calc';

/**
 * Keeps charts readable for long projections while preserving their final value.
 */
export function sampleForChart(
  rows: ProjectionRow[],
  maximumPoints = 250
): ProjectionRow[] {
  if (rows.length <= maximumPoints) {
    return rows;
  }

  const step = Math.ceil(rows.length / maximumPoints);
  const sampledRows = rows.filter((_, index) => index % step === 0);
  const finalRow = rows.at(-1);

  if (finalRow && sampledRows.at(-1) !== finalRow) {
    sampledRows.push(finalRow);
  }

  return sampledRows;
}
