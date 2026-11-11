// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser, createAdmin } from "./lib/testHelpers";
import { DAY_MS, WEEK_MS, dateKey } from "./lib/time";
import type { Id } from "./_generated/dataModel";

async function seedPlan(
  t: ReturnType<typeof convexTest>,
  overrides: Partial<{ weeklyReturnPercent: number; status: "active" | "paused" | "draft" | "closed" | "archived" }> = {}
) {
  const { admin } = await createAdmin(t);
  return await t.run((ctx) =>
    ctx.db.insert("investmentPlans", {
      name: "Foundation",
      description: "desc",
      minAmount: 200,
      maxAmount: 10_000,
      durationDays: 365,
      weeklyReturnPercent: overrides.weeklyReturnPercent ?? 1,
      accrualFrequency: "weekly",
      status: overrides.status ?? "active",
      createdBy: admin._id,
      createdAt: Date.now(),
    })
  );
}

async function seedInvestment(
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  planId: Id<"investmentPlans">,
  overrides: Partial<{
    amount: number;
    status: "pending" | "active" | "maturing" | "completed" | "cancelled" | "admin_paused" | "admin_ended";
    lastAccrualAt: number;
    startDate: number;
    maturityDate: number;
    accruedProfit: number;
  }> = {}
) {
  const now = Date.now();
  return await t.run((ctx) =>
    ctx.db.insert("investments", {
      userId,
      planId,
      amount: overrides.amount ?? 1000,
      startDate: overrides.startDate ?? now - 10 * DAY_MS,
      maturityDate: overrides.maturityDate ?? now + 355 * DAY_MS,
      accruedProfit: overrides.accruedProfit ?? 0,
      status: overrides.status ?? "active",
      lastAccrualAt: overrides.lastAccrualAt,
      createdAt: overrides.startDate ?? now - 10 * DAY_MS,
    })
  );
}

describe("investments.accrueWeeklyProfit", () => {
  it("accrues 1% of the investment amount for an active investment last accrued a week ago", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t, { profit: 0 });
    const planId = await seedPlan(t, { weeklyReturnPercent: 1 });
    const investmentId = await seedInvestment(t, user._id, planId, {
      amount: 1000,
      lastAccrualAt: Date.now() - WEEK_MS,
    });

    const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(result).toEqual({ accruedCount: 1, scanned: 1 });

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.accruedProfit).toBe(10);
    expect(investment?.lastAccrualAt).toBeGreaterThan(Date.now() - 5000);

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance?.profit).toBe(10);

    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals).toMatchObject([{ investmentId, amount: 10, accrualDate: dateKey(Date.now()) }]);

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "profit_accrual", amount: 10 }]);
  });

  it("does not double-accrue when run twice within the same week (idempotent)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t, { weeklyReturnPercent: 1 });
    await seedInvestment(t, user._id, planId, { amount: 1000, lastAccrualAt: Date.now() - WEEK_MS });

    await t.mutation(internal.investments.accrueWeeklyProfit, {});
    const secondRun = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(secondRun).toEqual({ accruedCount: 0, scanned: 1 });

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance?.profit).toBe(10);

    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals).toHaveLength(1);
  });

  it("skips admin_paused, admin_ended, pending, completed, and cancelled investments", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t, { weeklyReturnPercent: 1 });

    for (const status of ["pending", "admin_paused", "admin_ended", "completed", "cancelled"] as const) {
      await seedInvestment(t, user._id, planId, { status, lastAccrualAt: Date.now() - WEEK_MS });
    }

    const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(result).toEqual({ accruedCount: 0, scanned: 0 });

    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals).toHaveLength(0);
  });

  it("accrues for an investment with no prior lastAccrualAt (first week active)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t, { weeklyReturnPercent: 2 });
    await seedInvestment(t, user._id, planId, { amount: 500 });

    const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(result.accruedCount).toBe(1);

    const accruals = await t.run((ctx) => ctx.db.query("profitAccruals").collect());
    expect(accruals).toMatchObject([{ amount: 10 }]);
  });

  it("does not re-accrue an investment accrued less than a week ago", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t, { weeklyReturnPercent: 1 });
    await seedInvestment(t, user._id, planId, { amount: 1000, lastAccrualAt: Date.now() - DAY_MS });

    const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(result).toEqual({ accruedCount: 0, scanned: 1 });
  });

  it("still accrues when the cron fires slightly less than a full week after the last accrual (jitter)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t, { profit: 0 });
    const planId = await seedPlan(t, { weeklyReturnPercent: 1 });
    await seedInvestment(t, user._id, planId, { amount: 1000, lastAccrualAt: Date.now() - WEEK_MS + 5_000 });

    const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
    expect(result).toEqual({ accruedCount: 1, scanned: 1 });
  });

  it("pays every consecutive Monday even when each cron run starts a little earlier than the last", async () => {
    vi.useFakeTimers();
    try {
      const firstMonday = Date.UTC(2026, 0, 5, 0, 5, 0, 500); // Mon 00:05:00.500 UTC
      vi.setSystemTime(firstMonday);
      const t = convexTest(schema, convexTestModules);
      const { user } = await createVerifiedUser(t, { profit: 0 });
      const planId = await seedPlan(t, { weeklyReturnPercent: 1 });
      const investmentId = await seedInvestment(t, user._id, planId, { amount: 1000 });

      for (let week = 0; week < 4; week++) {
        vi.setSystemTime(firstMonday + week * WEEK_MS - week * 100); // 100ms earlier each week
        const result = await t.mutation(internal.investments.accrueWeeklyProfit, {});
        expect(result.accruedCount).toBe(1);
      }

      const investment = await t.run((ctx) => ctx.db.get(investmentId));
      expect(investment?.accruedProfit).toBe(40);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("investments.processMaturities", () => {
  it("completes a matured investment, returns principal, and notifies + emails the user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t, { available: 0, invested: 1000, profit: 50 });
    const planId = await seedPlan(t);
    const investmentId = await seedInvestment(t, user._id, planId, {
      amount: 1000,
      accruedProfit: 50,
      maturityDate: Date.now() - 1000,
    });

    const result = await t.mutation(internal.investments.processMaturities, {});
    expect(result).toEqual({ maturedCount: 1 });

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.status).toBe("completed");

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance).toMatchObject({ available: 1000, invested: 0, profit: 50 });

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "investment_completed" }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("leaves an investment that has not yet reached maturity untouched", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t);
    const investmentId = await seedInvestment(t, user._id, planId, { maturityDate: Date.now() + 30 * DAY_MS });

    const result = await t.mutation(internal.investments.processMaturities, {});
    expect(result).toEqual({ maturedCount: 0 });

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.status).toBe("active");
  });

  it("does not mature an admin_paused or admin_ended investment even past its maturity date", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t);
    const pausedId = await seedInvestment(t, user._id, planId, {
      status: "admin_paused",
      maturityDate: Date.now() - 1000,
    });

    const result = await t.mutation(internal.investments.processMaturities, {});
    expect(result).toEqual({ maturedCount: 0 });

    const investment = await t.run((ctx) => ctx.db.get(pausedId));
    expect(investment?.status).toBe("admin_paused");
  });
});
