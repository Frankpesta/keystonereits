export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

/** "YYYY-MM-DD" in UTC — the grain `profitAccruals.accrualDate` is stored at. */
export function dateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
