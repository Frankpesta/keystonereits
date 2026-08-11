import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Uses crons.cron (not the crons.daily helper docs/07-emails-notifications-cron.md's
 * illustrative snippet shows) per convex/_generated/ai/guidelines.md's
 * explicit instruction to prefer crons.interval/crons.cron over the
 * hourly/daily/weekly helpers — same schedule, just expressed as a cron string.
 */
const crons = cronJobs();

// 00:05 UTC every Monday. Runs first so a same-day maturity still reflects
// that week's final accrual before processMaturities completes the investment.
crons.cron("accrue-weekly-profit", "5 0 * * 1", internal.investments.accrueWeeklyProfit, {});

// 00:15 UTC daily — maturities can land on any day, not just the weekly accrual day.
crons.cron("process-maturing-investments", "15 0 * * *", internal.investments.processMaturities, {});

export default crons;
