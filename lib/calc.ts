import { enumerateTradingDays } from './tradingDays';

export interface ProjectionRow {
  period: number;
  date: string;
  initialCapital: number;
  periodProfit: number;
  accumulatedCapital: number;
}

export interface ProjectionInput {
  principal: number;
  dailyRatePercent: number;
  tradingDays: number;
  startDate?: string;
}

const maximumTradingDays = 4000;

function todayAsDateString(): string {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;

  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Calculates daily compound growth over NYSE trading days.
 *
 * The trading-day count is constrained to 4,000 so the detailed table remains
 * responsive while still supporting projections of roughly 15 years.
 */
export function computeProjections({
  principal,
  dailyRatePercent,
  tradingDays,
  startDate = todayAsDateString()
}: ProjectionInput): ProjectionRow[] {
  const rows: ProjectionRow[] = [];
  const tradingDayCount = Math.max(
    0,
    Math.min(Math.floor(tradingDays), maximumTradingDays)
  );
  const rate = dailyRatePercent / 100;
  let balance = principal;

  for (const [index, date] of enumerateTradingDays(startDate, tradingDayCount).entries()) {
    const initialCapital = balance;
    const periodProfit = initialCapital * rate;
    const accumulatedCapital = initialCapital + periodProfit;

    rows.push({
      period: index + 1,
      date,
      initialCapital,
      periodProfit,
      accumulatedCapital
    });

    balance = accumulatedCapital;
  }

  return rows;
}
