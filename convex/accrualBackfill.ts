import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { writeTransaction } from "./lib/ledger";
import { DAY_MS, WEEK_MS, dateKey } from "./lib/time";
import type { Doc } from "./_generated/dataModel";

/**
 * One-off compensation for the accrual-jitter bug (accrueWeeklyProfit used to
 * compare against exactly WEEK_MS, so roughly every other Monday's run was
 * skipped). For each investment it replays the Monday schedule and credits
 * any Monday the cron should have paid but didn't.
 *
 * A Monday counts as "owed" when ALL of these hold:
 *  - it falls after the investment's first real accrual (the bug can only
 *    skip a week once lastAccrualAt is set, so earlier Mondays are untouched);
 *  - its 00:05 UTC cron time is in the past;
 *  - the investment had not yet been matured by then (processMaturities runs
 *    daily at 00:15, so anything maturing after Sunday 00:15 was still
 *    active at Monday 00:05);
 *  - no admin pause/end override was in effect at that moment;
 *  - no accrual already exists in the 7-day window ending on that Monday.
 *
 * Each owed week is paid at the amount of the most recent real accrual before
 * it (i.e. the rate the cron was actually paying at the time), and recorded as
 * a normal profitAccruals row dated on the missed Monday. That row is what
 * makes re-runs safe: a second pass sees the week as covered and skips it.
 *
 * Run a dry run first (`dryRun: true`), review, then run for real.
 */

const CRON_OFFSET_MS = 5 * 60 * 1000; // cron fires at 00:05 UTC
const MATURITY_SWEEP_OFFSET_MS = 15 * 60 * 1000; // processMaturities fires at 00:15 UTC
const PAGE_SIZE = 50;

export type MissedWeek = { accrualDate: string; amount: number };

function dayStartMs(key: string): number {
  return Date.parse(`${key}T00:00:00.000Z`);
}

/** Pure: which Mondays should have paid this investment but didn't. */
export function findMissedAccruals(
  investment: Pick<Doc<"investments">, "maturityDate">,
  accruals: Pick<Doc<"profitAccruals">, "accrualDate" | "amount">[],
  overrides: Pick<Doc<"investmentOverrides">, "action" | "createdAt">[],
  now: number
): MissedWeek[] {
  if (accruals.length === 0) return [];

  const sortedAccruals = [...accruals].sort((a, b) => a.accrualDate.localeCompare(b.accrualDate));
  const sortedOverrides = [...overrides].sort((a, b) => a.createdAt - b.createdAt);
  const accrualDays = sortedAccruals.map((a) => dayStartMs(a.accrualDate));

  const isHeldByAdmin = (at: number) => {
    let held = false;
    for (const o of sortedOverrides) {
      if (o.createdAt > at) break;
      held = o.action !== "restart";
    }
    return held;
  };

  // First Monday strictly after the first accrual day (getUTCDay: 1 = Monday).
  let monday = accrualDays[0] + DAY_MS;
  while (new Date(monday).getUTCDay() !== 1) monday += DAY_MS;

  const missed: MissedWeek[] = [];
  for (; monday + CRON_OFFSET_MS <= now; monday += WEEK_MS) {
    const cronAt = monday + CRON_OFFSET_MS;
    const previousMaturitySweep = monday - DAY_MS + MATURITY_SWEEP_OFFSET_MS;
    if (investment.maturityDate <= previousMaturitySweep) break;
    if (isHeldByAdmin(cronAt)) continue;

    const covered = accrualDays.some((d) => d > monday - WEEK_MS && d <= monday);
    if (covered) continue;

    let rateSource: (typeof sortedAccruals)[number] | undefined;
    for (let i = 0; i < accrualDays.length && accrualDays[i] < monday; i++) rateSource = sortedAccruals[i];
    if (!rateSource || rateSource.amount <= 0) continue;

    missed.push({ accrualDate: dateKey(monday), amount: rateSource.amount });
  }
  return missed;
}

export const compensateMissedAccruals = internalMutation({
  args: {
    dryRun: v.boolean(),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const page = await ctx.db
      .query("investments")
      .paginate({ cursor: args.cursor ?? null, numItems: PAGE_SIZE });

    const results: {
      investmentId: string;
      userId: string;
      weeks: MissedWeek[];
      total: number;
    }[] = [];

    for (const investment of page.page) {
      const [accruals, overrides] = await Promise.all([
        ctx.db
          .query("profitAccruals")
          .withIndex("by_investment", (q) => q.eq("investmentId", investment._id))
          .take(1000),
        ctx.db
          .query("investmentOverrides")
          .withIndex("by_investment", (q) => q.eq("investmentId", investment._id))
          .take(1000),
      ]);

      const weeks = findMissedAccruals(investment, accruals, overrides, now);
      if (weeks.length === 0) continue;

      const total = Math.round(weeks.reduce((sum, w) => sum + w.amount, 0) * 100) / 100;
      results.push({ investmentId: investment._id, userId: investment.userId, weeks, total });
      if (args.dryRun) continue;

      for (const week of weeks) {
        await ctx.db.insert("profitAccruals", {
          userId: investment.userId,
          investmentId: investment._id,
          planId: investment.planId,
          amount: week.amount,
          accrualDate: week.accrualDate,
        });
        await writeTransaction(ctx, {
          userId: investment.userId,
          type: "profit_accrual",
          amount: week.amount,
          status: "completed",
          relatedId: investment._id,
        });
      }

      await ctx.db.patch(investment._id, { accruedProfit: investment.accruedProfit + total });

      const balance = await ctx.db
        .query("balances")
        .withIndex("by_user", (q) => q.eq("userId", investment.userId))
        .unique();
      if (balance) {
        await ctx.db.patch(balance._id, { profit: balance.profit + total, updatedAt: now });
      }

      const plan = await ctx.db.get(investment.planId);
      await ctx.db.insert("notifications", {
        userId: investment.userId,
        type: "profit_compensation",
        title: "Missed Profit Payouts Credited",
        body: `We found ${weeks.length} weekly profit payout${weeks.length === 1 ? "" : "s"} on your ${plan ? `${plan.name} ` : ""}investment that were not credited on time. $${total.toLocaleString()} has been added to your profit balance.`,
        relatedId: investment._id,
        read: false,
        createdAt: now,
      });
    }

    const pageTotal = Math.round(results.reduce((sum, r) => sum + r.total, 0) * 100) / 100;
    console.log(
      `[compensateMissedAccruals] dryRun=${args.dryRun} scanned=${page.page.length} ` +
        `investmentsOwed=${results.length} weeksOwed=${results.reduce((n, r) => n + r.weeks.length, 0)} total=$${pageTotal}`
    );

    // Live runs walk the whole table on their own; dry runs return the cursor
    // so every page's findings stay visible to whoever is reviewing them.
    if (!args.dryRun && !page.isDone) {
      await ctx.scheduler.runAfter(0, internal.accrualBackfill.compensateMissedAccruals, {
        dryRun: false,
        cursor: page.continueCursor,
      });
    }

    return { results, pageTotal, isDone: page.isDone, continueCursor: page.continueCursor };
  },
});
