import type { ProjectionRow } from './calc';
import type { Granularity } from './types';

export interface ProjectionSummaryRow {
  label: string;
  initialCapital: number;
  periodProfit: number;
  accumulatedCapital: number;
  cumulativeProfitPercent: number;
}

function getIsoWeekLabel(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

function getBucketLabel(date: string, granularity: Granularity): string {
  switch (granularity) {
    case 'years':
      return date.slice(0, 4);
    case 'months':
      return date.slice(0, 7);
    case 'weeks':
      return getIsoWeekLabel(date);
    case 'days':
      return date;
  }
}

/**
 * Collapses daily projections into real calendar buckets. Each bucket keeps the
 * first day's opening capital and the final day's closing capital.
 */
export function aggregateProjections(
  rows: ProjectionRow[],
  granularity: Granularity
): ProjectionSummaryRow[] {
  const summaries: ProjectionSummaryRow[] = [];
  const principal = rows[0]?.initialCapital ?? 0;
  let currentSummary: ProjectionSummaryRow | undefined;

  for (const row of rows) {
    const label = getBucketLabel(row.date, granularity);

    if (!currentSummary || currentSummary.label !== label) {
      currentSummary = {
        label,
        initialCapital: row.initialCapital,
        periodProfit: 0,
        accumulatedCapital: row.accumulatedCapital,
        cumulativeProfitPercent: 0
      };
      summaries.push(currentSummary);
    }

    currentSummary.periodProfit += row.periodProfit;
    currentSummary.accumulatedCapital = row.accumulatedCapital;
    currentSummary.cumulativeProfitPercent = principal === 0
      ? 0
      : ((row.accumulatedCapital / principal) - 1) * 100;
  }

  return summaries;
}
