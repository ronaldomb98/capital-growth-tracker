import { parseDate } from '@internationalized/date';
import { isTradingDay } from './tradingDays';

export const maximumTrades = 4000;
export const maximumTradesPerWeek = 100;
export const minimumDate = '2000-01-01';
export const maximumDate = '2100-12-31';
export type ScheduleMode = 'dates' | 'trades';
export type ScheduleError = 'dates' | 'weekly' | 'count' | 'limit' | 'horizon';

export interface ScheduleInput {
  mode: ScheduleMode;
  startDate: string;
  endDate: string;
  tradeCount: number;
  tradesPerWeek: number;
}

export interface TradeSchedule {
  dates: string[];
  error?: ScheduleError;
}

export function isValidDate(value: string): boolean {
  try {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      && value >= minimumDate && value <= maximumDate
      && parseDate(value).toString() === value;
  } catch {
    return false;
  }
}

/**
 * Weeks run Monday–Sunday. Spread the weekly quota across the week's NYSE
 * sessions, starting with the first session. Holidays compress the schedule;
 * partial weeks keep only the slots inside the inclusive date range. Several
 * trades may share a session. Both input modes use this same schedule.
 */
export function buildTradeSchedule(input: ScheduleInput): TradeSchedule {
  const { mode, startDate, endDate, tradeCount, tradesPerWeek } = input;
  if (!isValidDate(startDate) || (mode === 'dates'
    && (!isValidDate(endDate) || endDate < startDate))) {
    return { dates: [], error: 'dates' };
  }
  if (!Number.isInteger(tradesPerWeek) || tradesPerWeek < 1
    || tradesPerWeek > maximumTradesPerWeek) {
    return { dates: [], error: 'weekly' };
  }
  if (mode === 'trades' && (!Number.isInteger(tradeCount)
    || tradeCount < 1 || tradeCount > maximumTrades)) {
    return { dates: [], error: 'count' };
  }

  const start = parseDate(startDate);
  const weekday = new Date(`${startDate}T00:00:00Z`).getUTCDay();
  let monday = start.subtract({ days: (weekday + 6) % 7 });
  const dates: string[] = [];
  const lastDate = mode === 'dates' ? endDate : maximumDate;

  while (monday.toString() <= lastDate) {
    const sessions = Array.from({ length: 7 }, (_, index) =>
      monday.add({ days: index }).toString()).filter(isTradingDay);
    for (let slot = 0; sessions.length > 0 && slot < tradesPerWeek; slot += 1) {
      const date = sessions[Math.floor(slot * sessions.length / tradesPerWeek)];
      if (date < startDate || date > lastDate) continue;
      dates.push(date);
      if (mode === 'trades' && dates.length === tradeCount) return { dates };
      // Never present a silently truncated projection as the entire range.
      if (dates.length > maximumTrades) return { dates: [], error: 'limit' };
    }
    monday = monday.add({ days: 7 });
  }
  return mode === 'trades' ? { dates: [], error: 'horizon' } : { dates };
}
