// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import { DAY_MS, dateKey } from "../lib/time";
import type { Id } from "../_generated/dataModel";

async function seedPlan(t: ReturnType<typeof convexTest>, adminId: Id<"admins">) {
  return await t.run((ctx) =>
    ctx.db.insert("investmentPlans", {
      name: "Foundation",
      description: "desc",
      minAmount: 200,
      maxAmount: 10_000,
      durationDays: 365,
      weeklyReturnPercent: 4,
      accrualFrequency: "weekly",
      status: "active",
      createdBy: adminId,
      createdAt: Date.now(),
    })
  );
}

describe("admin/dashboard.kpis", () => {
  it("aggregates totals across users, deposits, withdrawals, investments, referrals", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t);
    const investor = await createVerifiedUser(t, { kycStatus: "approved" });
    await createVerifiedUser(t, { kycStatus: "pending" });

    const planId = await seedPlan(t, admin._id);

    await t.run((ctx) =>
      ctx.db.insert("deposits", {
        userId: investor.user._id,
        method: "crypto",
        amountUsd: 500,
        status: "credited",
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("deposits", {
        userId: investor.user._id,
        method: "crypto",
        amountUsd: 200,
        status: "pending",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) =>
      ctx.db.insert("withdrawals", {
        userId: investor.user._id,
        balanceSource: "available",
        amountUsd: 100,
        walletAddress: "addr",
        network: "TRC20",
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("withdrawals", {
        userId: investor.user._id,
        balanceSource: "available",
        amountUsd: 50,
        walletAddress: "addr",
        network: "TRC20",
        status: "pending",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) =>
      ctx.db.insert("investments", {
        userId: investor.user._id,
        planId,
        amount: 1000,
        startDate: Date.now(),
        maturityDate: Date.now() + 365 * DAY_MS,
        accruedProfit: 25,
        status: "active",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", {
        referrerId: investor.user._id,
        referredUserId: investor.user._id,
        amount: 15,
        createdAt: Date.now(),
      })
    );

    const kpis = await t.query(api.admin.dashboard.kpis, { sessionToken });
    expect(kpis).toMatchObject({
      totalUsers: 2,
      verifiedUsers: 1,
      pendingKyc: 1,
      totalDeposited: 500,
      pendingDeposits: 1,
      totalWithdrawn: 100,
      pendingWithdrawals: 1,
      totalInvested: 1000,
      activeInvestments: 1,
      completedInvestments: 0,
      totalAccruedProfit: 25,
      referralCount: 1,
      totalReferralEarnings: 15,
    });
  });

  it("rejects a non-admin session", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);
    await expect(t.query(api.admin.dashboard.kpis, { sessionToken })).rejects.toThrow(ConvexError);
  });
});

describe("admin/dashboard.depositsVsWithdrawalsTrend", () => {
  it("sums credited deposits and completed withdrawals by day, within the trend window", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t);
    const today = dateKey(Date.now());

    await t.run((ctx) =>
      ctx.db.insert("deposits", {
        userId: user._id,
        method: "crypto",
        amountUsd: 300,
        status: "credited",
        createdAt: Date.now(),
      })
    );
    // Outside the 30-day window — must not appear.
    await t.run((ctx) =>
      ctx.db.insert("deposits", {
        userId: user._id,
        method: "crypto",
        amountUsd: 999,
        status: "credited",
        createdAt: Date.now() - 40 * DAY_MS,
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("withdrawals", {
        userId: user._id,
        balanceSource: "available",
        amountUsd: 120,
        walletAddress: "addr",
        network: "TRC20",
        status: "completed",
        createdAt: Date.now(),
        completedAt: Date.now(),
      })
    );

    const trend = await t.query(api.admin.dashboard.depositsVsWithdrawalsTrend, { sessionToken, now: Date.now() });
    expect(trend).toEqual([{ date: today, deposits: 300, withdrawals: 120 }]);
  });
});

describe("admin/dashboard.investmentsByPlan", () => {
  it("groups investments by plan name with count and total amount", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t);
    const planId = await seedPlan(t, admin._id);

    await t.run((ctx) =>
      ctx.db.insert("investments", {
        userId: user._id,
        planId,
        amount: 500,
        startDate: Date.now(),
        maturityDate: Date.now() + DAY_MS,
        accruedProfit: 0,
        status: "active",
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("investments", {
        userId: user._id,
        planId,
        amount: 700,
        startDate: Date.now(),
        maturityDate: Date.now() + DAY_MS,
        accruedProfit: 0,
        status: "active",
        createdAt: Date.now(),
      })
    );

    const byPlan = await t.query(api.admin.dashboard.investmentsByPlan, { sessionToken });
    expect(byPlan).toEqual([{ plan: "Foundation", count: 2, amount: 1200 }]);
  });
});

describe("admin/dashboard.recentActivity", () => {
  it("joins the transaction with the user's name", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });

    await t.run((ctx) =>
      ctx.db.insert("transactions", {
        userId: user._id,
        type: "deposit",
        amount: 250,
        status: "pending",
        createdAt: Date.now(),
      })
    );

    const activity = await t.query(api.admin.dashboard.recentActivity, { sessionToken });
    expect(activity).toMatchObject([{ amount: 250, userName: "Ada Lovelace" }]);
  });
});
