export interface ProjectionRow {
  period: number;
  initialCapital: number;
  periodProfit: number;
  accumulatedCapital: number;
}

export interface ProjectionInput {
  principal: number;
  ratePercent: number;
  periods: number;
}

const maximumPeriods = 1000;

/**
 * Calculates the compound growth for every requested period.
 *
 * The period count is constrained to 1,000 so the detailed table remains
 * responsive while still supporting long-running projections.
 */
export function computeProjections({
  principal,
  ratePercent,
  periods
}: ProjectionInput): ProjectionRow[] {
  const rows: ProjectionRow[] = [];
  const periodCount = Math.max(0, Math.min(Math.floor(periods), maximumPeriods));
  const rate = ratePercent / 100;
  let balance = principal;

  for (let period = 1; period <= periodCount; period += 1) {
    const initialCapital = balance;
    const periodProfit = initialCapital * rate;
    const accumulatedCapital = initialCapital + periodProfit;

    rows.push({
      period,
      initialCapital,
      periodProfit,
      accumulatedCapital
    });

    balance = accumulatedCapital;
  }

  return rows;
}
