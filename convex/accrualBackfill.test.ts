// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser, createAdmin } from "./lib/testHelpers";
import { DAY_MS } from "./lib/time";
import { findMissedAccruals } from "./accrualBackfill";

// Mondays in Jan/Feb 2026: 5, 12, 19, 26, Feb 2, 9.
const at = (iso: string) => Date.parse(iso);
const NOW = at("2026-02-10T12:00:00Z"); // Tuesday after the Feb 9 run
const FAR_MATURITY = NOW + 300 * DAY_MS;

describe("findMissedAccruals", () => {
  it("finds Mondays skipped between fortnightly payouts, including the latest one", () => {
    const missed = findMissedAccruals(
      { maturityDate: FAR_MATURITY },
      [
        { accrualDate: "2026-01-05", amount: 10 },
        { accrualDate: "2026-01-19", amount: 10 },
        { accrualDate: "2026-02-02", amount: 10 },
      ],
      [],
      NOW
    );
    expect(missed).toEqual([
      { accrualDate: "2026-01-12", amount: 10 },
      { accrualDate: "2026-01-26", amount: 10 },
      { accrualDate: "2026-02-09", amount: 10 },
    ]);
  });

  it("returns nothing for an investment that was paid every week", () => {
    const accruals = ["2026-01-05", "2026-01-12", "2026-01-19", "2026-01-26", "2026-02-02", "2026-02-09"].map(
      (accrualDate) => ({ accrualDate, amount: 10 })
    );
    expect(findMissedAccruals({ maturityDate: FAR_MATURITY }, accruals, [], NOW)).toEqual([]);
  });

  it("returns nothing for an investment that never accrued", () => {
    expect(findMissedAccruals({ maturityDate: FAR_MATURITY }, [], [], NOW)).toEqual([]);
  });

  it("does not owe weeks while an admin pause or end was in effect", () => {
    const missed = findMissedAccruals(
      { maturityDate: FAR_MATURITY },
      [{ accrualDate: "2026-01-05", amount: 10 }],
      [
        { action: "pause", createdAt: at("2026-01-08T00:00:00Z") },
        { action: "restart", createdAt: at("2026-01-22T00:00:00Z") },
        { action: "end", createdAt: at("2026-02-04T00:00:00Z") },
      ],
      NOW
    );
    // 12th and 19th paused, 26th and Feb 2 owed, Feb 9 ended.
    expect(missed.map((m) => m.accrualDate)).toEqual(["2026-01-26", "2026-02-02"]);
  });

  it("stops at maturity, but still owes a Monday whose maturity landed after Sunday's sweep", () => {
    const accruals = [{ accrualDate: "2026-01-05", amount: 10 }];
    // Matures Sunday 18:00 → still active at Monday 00:05, so Jan 26 is owed; Feb 2 is not.
    const missed = findMissedAccruals({ maturityDate: at("2026-01-25T18:00:00Z") }, accruals, [], NOW);
    expect(missed.map((m) => m.accrualDate)).toEqual(["2026-01-12", "2026-01-19", "2026-01-26"]);

    // Matures Sunday 00:10 → swept at Sunday 00:15, so Jan 26 is not owed.
    const early = findMissedAccruals({ maturityDate: at("2026-01-25T00:10:00Z") }, accruals, [], NOW);
    expect(early.map((m) => m.accrualDate)).toEqual(["2026-01-12", "2026-01-19"]);
  });

  it("pays each missed week at the most recent real accrual amount before it", () => {
    const missed = findMissedAccruals(
      { maturityDate: FAR_MATURITY },
      [
        { accrualDate: "2026-01-05", amount: 10 },
        { accrualDate: "2026-01-19", amount: 12 },
      ],
      [],
      at("2026-01-27T00:00:00Z")
    );
    expect(missed).toEqual([
      { accrualDate: "2026-01-12", amount: 10 },
      { accrualDate: "2026-01-26", amount: 12 },
    ]);
  });
});

describe("compensateMissedAccruals", () => {
  afterEach(() => vi.useRealTimers());

  async function seedSkippedInvestment(t: ReturnType<typeof convexTest>) {
    const { user } = await createVerifiedUser(t, { profit: 20 });
    const { admin } = await createAdmin(t);
    const ids = await t.run(async (ctx) => {
      const planId = await ctx.db.insert("investmentPlans", {
        name: "Foundation",
        description: "desc",
        minAmount: 200,
        maxAmount: 10_000,
        durationDays: 365,
        weeklyReturnPercent: 1,
        accrualFrequency: "weekly",
        status: "active",
        createdBy: admin._id,
        createdAt: at("2026-01-01T00:00:00Z"),
      });
      const investmentId = await ctx.db.insert("investments", {
        userId: user._id,
        planId,
        amount: 1000,
        startDate: at("2026-01-02T00:00:00Z"),
        maturityDate: FAR_MATURITY,
        accruedProfit: 20,
        status: "active",
        lastAccrualAt: at("2026-01-19T00:05:00Z"),
        createdAt: at("2026-01-02T00:00:00Z"),
      });
      for (const accrualDate of ["2026-01-05", "2026-01-19"]) {
        await ctx.db.insert("profitAccruals", { userId: user._id, investmentId, planId, amount: 10, accrualDate });
      }
      return { planId, investmentId };
    });
    return { user, ...ids };
  }

  it("dry run reports what is owed without changing anything", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(at("2026-01-27T12:00:00Z"));
    const t = convexTest(schema, convexTestModules);
    const { user, investmentId } = await seedSkippedInvestment(t);

    const result = await t.mutation(internal.accrualBackfill.compensateMissedAccruals, { dryRun: true });
    expect(result.isDone).toBe(true);
    expect(result.pageTotal).toBe(20);
    expect(result.results).toMatchObject([
      { investmentId, total: 20, weeks: [{ accrualDate: "2026-01-12" }, { accrualDate: "2026-01-26" }] },
    ]);

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance?.profit).toBe(20);
    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals).toHaveLength(2);
  });

  it("credits missed weeks once and is safe to re-run", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(at("2026-01-27T12:00:00Z"));
    const t = convexTest(schema, convexTestModules);
    const { user, investmentId } = await seedSkippedInvestment(t);

    await t.mutation(internal.accrualBackfill.compensateMissedAccruals, { dryRun: false });
    const rerun = await t.mutation(internal.accrualBackfill.compensateMissedAccruals, { dryRun: false });
    expect(rerun.results).toEqual([]);

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.accruedProfit).toBe(40);

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance?.profit).toBe(40);

    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals.map((a) => a.accrualDate).sort()).toEqual(["2026-01-05", "2026-01-12", "2026-01-19", "2026-01-26"]);

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([
      { type: "profit_accrual", amount: 10 },
      { type: "profit_accrual", amount: 10 },
    ]);

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "profit_compensation" }]);
  });
});
