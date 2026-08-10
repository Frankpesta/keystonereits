/** The platform has no production domain yet (Phase 8 covers deployment) — falls back to localhost for dev/test sends. */
export function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}
