const millisecondsPerDay = 24 * 60 * 60 * 1000;

function asUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, count: number): Date {
  return new Date(date.getTime() + count * millisecondsPerDay);
}

function observedFixedHoliday(year: number, month: number, day: number): string {
  const holiday = new Date(Date.UTC(year, month - 1, day));
  const weekday = holiday.getUTCDay();

  if (weekday === 6) {
    return formatDate(addDays(holiday, -1));
  }

  if (weekday === 0) {
    return formatDate(addDays(holiday, 1));
  }

  return formatDate(holiday);
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  occurrence: number
): string {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - firstDay.getUTCDay() + 7) % 7;

  return formatDate(new Date(Date.UTC(year, month - 1, 1 + offset + 7 * (occurrence - 1))));
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0));
  const offset = (lastDay.getUTCDay() - weekday + 7) % 7;

  return formatDate(addDays(lastDay, -offset));
}

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = (h + l - 7 * m + 114) % 31 + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Returns the standard full-day NYSE market holidays observed within a calendar
 * year. Ad-hoc market closures are intentionally outside this predictable
 * annual calendar.
 */
export function nyseHolidays(year: number): Set<string> {
  const holidays = new Set<string>([
    nthWeekdayOfMonth(year, 1, 1, 3), // Martin Luther King Jr. Day
    nthWeekdayOfMonth(year, 2, 1, 3), // Washington's Birthday
    formatDate(addDays(easterSunday(year), -2)), // Good Friday
    lastWeekdayOfMonth(year, 5, 1), // Memorial Day
    observedFixedHoliday(year, 7, 4), // Independence Day
    nthWeekdayOfMonth(year, 9, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 11, 4, 4), // Thanksgiving
    observedFixedHoliday(year, 12, 25) // Christmas
  ]);

  const newYearsDay = new Date(Date.UTC(year, 0, 1));
  if (newYearsDay.getUTCDay() !== 6) {
    holidays.add(observedFixedHoliday(year, 1, 1));
  }

  // NYSE stays open on the preceding Friday when New Year's Day is Saturday.

  if (year >= 2022) {
    holidays.add(observedFixedHoliday(year, 6, 19)); // Juneteenth
  }

  return holidays;
}

export function isTradingDay(date: string): boolean {
  const utcDate = asUtcDate(date);
  const weekday = utcDate.getUTCDay();

  return weekday !== 0 && weekday !== 6 && !nyseHolidays(utcDate.getUTCFullYear()).has(date);
}

/**
 * Produces the requested number of NYSE trading dates at or after `startDate`.
 */
export function enumerateTradingDays(startDate: string, count: number): string[] {
  const dates: string[] = [];
  let date = asUtcDate(startDate);

  while (dates.length < Math.max(0, Math.floor(count))) {
    const formattedDate = formatDate(date);

    if (isTradingDay(formattedDate)) {
      dates.push(formattedDate);
    }

    date = addDays(date, 1);
  }

  return dates;
}
