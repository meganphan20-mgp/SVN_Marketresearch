/**
 * DATE BOUNDARIES UTILITY (CALENDAR-BASED IN ASIA/HO_CHI_MINH)
 * 
 * Strict Principles:
 * - Timezone for all Daily & Weekly publication boundaries is Asia/Ho_Chi_Minh (UTC+7).
 * - Weekly boundaries follow Monday 00:00:00.000 through Sunday 23:59:59.999.
 * - Calendar-based boundaries only (NO rolling "now - 7 days" or "now - 24 hours").
 * - Returns values suitable for both PostgreSQL DATE ('YYYY-MM-DD') and TIMESTAMPTZ filtering.
 */

export const SOJITZ_TIMEZONE = 'Asia/Ho_Chi_Minh';

export interface CalendarDayBoundaries {
  dateStr: string;            // 'YYYY-MM-DD'
  dayStartTimestamp: string;  // ISO / offset timestamp at 00:00:00.000
  dayEndTimestamp: string;    // ISO / offset timestamp at 23:59:59.999
  startDate: Date;            // JS Date in UTC
  endDate: Date;              // JS Date in UTC
}

export interface CalendarWeekBoundaries {
  year: number;               // Calendar year of the week
  weekNumber: number;         // 1-53 calendar week number
  weekStart: string;          // Monday 'YYYY-MM-DD'
  weekEnd: string;            // Sunday 'YYYY-MM-DD'
  weekStartTimestamp: string; // Monday 00:00:00.000 in target timezone
  weekEndTimestamp: string;   // Sunday 23:59:59.999 in target timezone
  startDate: Date;            // JS Date for Monday start (UTC)
  endDate: Date;              // JS Date for Sunday end (UTC)
}

/**
 * Formats a Date or timestamp string into calendar date YYYY-MM-DD in the specified timezone.
 */
export function getLocalDateInTimeZone(
  date?: Date | string | number | null,
  timeZone: string = SOJITZ_TIMEZONE
): string {
  const d = date 
    ? (date instanceof Date ? date : new Date(date))
    : new Date();

  if (isNaN(d.getTime())) {
    // If unparseable string, return today's date in timezone
    return getLocalDateInTimeZone(new Date(), timeZone);
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return formatter.format(d);
}

/**
 * Returns today's calendar date YYYY-MM-DD in Asia/Ho_Chi_Minh.
 */
export function getTodayLocal(timeZone: string = SOJITZ_TIMEZONE): string {
  return getLocalDateInTimeZone(new Date(), timeZone);
}

/**
 * Extracts and normalizes publication date to calendar date YYYY-MM-DD in Asia/Ho_Chi_Minh.
 */
export function getPublicationDateLocal(
  publishedAt: string | Date | null | undefined,
  timeZone: string = SOJITZ_TIMEZONE
): string | null {
  if (!publishedAt) return null;
  const d = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
  if (isNaN(d.getTime())) return null;

  return getLocalDateInTimeZone(d, timeZone);
}

/**
 * Returns start-of-day and end-of-day boundaries for a given calendar date in Asia/Ho_Chi_Minh.
 */
export function getCalendarDayBoundariesLocal(
  target?: Date | string | null,
  timeZone: string = SOJITZ_TIMEZONE
): CalendarDayBoundaries {
  const dateStr = getLocalDateInTimeZone(target, timeZone);
  const [yearStr, monthStr, dayStr] = dateStr.split('-');

  // Asia/Ho_Chi_Minh is UTC+7 (no daylight saving time)
  const dayStartTimestamp = `${dateStr}T00:00:00.000+07:00`;
  const dayEndTimestamp = `${dateStr}T23:59:59.999+07:00`;

  return {
    dateStr,
    dayStartTimestamp,
    dayEndTimestamp,
    startDate: new Date(dayStartTimestamp),
    endDate: new Date(dayEndTimestamp),
  };
}

/**
 * Computes calendar week boundaries (Monday through Sunday) in Asia/Ho_Chi_Minh.
 * 
 * Rules:
 * - Week starts Monday 00:00:00.000
 * - Week ends Sunday 23:59:59.999
 * - Handles week start/end across month and year transitions.
 */
export function getCalendarWeekBoundariesLocal(
  target?: Date | string | null,
  timeZone: string = SOJITZ_TIMEZONE
): CalendarWeekBoundaries {
  const dateStr = getLocalDateInTimeZone(target, timeZone);
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Use noon UTC to avoid any leap-second / DST shift issues when calculating calendar offsets
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = noonUtc.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  // In Monday-Sunday calendar weeks:
  // If Sunday (0), Monday is 6 days earlier (-6) and Sunday is today (0).
  // If Monday (1), Monday is today (0) and Sunday is 6 days later (+6).
  // If Wednesday (3), Monday is 2 days earlier (-2) and Sunday is 4 days later (+4).
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const mondayDate = new Date(Date.UTC(year, month - 1, day + diffToMonday, 12, 0, 0));
  const sundayDate = new Date(Date.UTC(year, month - 1, day + diffToSunday, 12, 0, 0));

  const fmtDate = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dt = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  };

  const weekStart = fmtDate(mondayDate);
  const weekEnd = fmtDate(sundayDate);

  const weekStartTimestamp = `${weekStart}T00:00:00.000+07:00`;
  const weekEndTimestamp = `${weekEnd}T23:59:59.999+07:00`;

  // ISO 8601 calendar week calculation (Thursday in the week determines the year)
  const targetThursday = new Date(Date.UTC(mondayDate.getUTCFullYear(), mondayDate.getUTCMonth(), mondayDate.getUTCDate() + 3, 12, 0, 0));
  const weekYear = targetThursday.getUTCFullYear();
  // Jan 4th is always in week 1
  const jan4th = new Date(Date.UTC(weekYear, 0, 4, 12, 0, 0));
  const dayOffset = (jan4th.getUTCDay() || 7) - 1; // days since Monday of week 1
  const week1Monday = new Date(Date.UTC(weekYear, 0, 4 - dayOffset, 12, 0, 0));
  const daysDiff = Math.floor((mondayDate.getTime() - week1Monday.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.max(1, Math.min(53, Math.floor(daysDiff / 7) + 1));

  return {
    year: weekYear,
    weekNumber,
    weekStart,
    weekEnd,
    weekStartTimestamp,
    weekEndTimestamp,
    startDate: new Date(weekStartTimestamp),
    endDate: new Date(weekEndTimestamp),
  };
}
