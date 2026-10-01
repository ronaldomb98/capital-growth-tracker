export interface ProjectionRow {
  period: number;
  date: string;
  initialCapital: number;
  periodProfit: number;
  accumulatedCapital: number;
}

export interface ProjectionInput {
  principal: number;
  ratePercent: number;
  tradeDates: string[];
}

/** Compound once per trade, including multiple trades on the same date. */
export function computeProjections({
  principal,
  ratePercent,
  tradeDates
}: ProjectionInput): ProjectionRow[] {
  if (!Number.isFinite(principal) || principal < 0
    || !Number.isFinite(ratePercent) || ratePercent < 0) return [];

  const rows: ProjectionRow[] = [];
  const rate = ratePercent / 100;
  let balance = principal;

  for (const [index, date] of tradeDates.entries()) {
    const initialCapital = balance;
    const periodProfit = initialCapital * rate;
    const accumulatedCapital = initialCapital + periodProfit;
    // A huge projection must not send Infinity or NaN into the charts.
    if (!Number.isFinite(accumulatedCapital)) return [];
    rows.push({ period: index + 1, date, initialCapital, periodProfit, accumulatedCapital });
    balance = accumulatedCapital;
  }
  return rows;
}
