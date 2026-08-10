import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentAdmin } from "../lib/auth";
import { dateKey } from "../lib/time";

/**
 * Every query below scans a full table — acceptable at this app's current
 * dev/MVP scale (see docs/06-admin-dashboard.md: "pull from lightweight
 * aggregate queries", which these are, just not yet backed by an aggregate
 * index). At real production scale, replace with @convex-dev/aggregate
 * counters kept in sync in the same mutation as every source-table write —
 * see the Convex guidelines' note on counting/summing over large tables.
 */

const PENDING_WITHDRAWAL_STATUSES = new Set(["pending", "under_review", "approved", "processing"]);
const PENDING_DEPOSIT_STATUSES = new Set(["pending", "under_review"]);
const TREND_WINDOW_DAYS = 30;
const TREND_WINDOW_MS = TREND_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export const kpis = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);

    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.kycStatus === "approved").length;
    const pendingKyc = users.filter((u) => u.kycStatus === "pending" || u.kycStatus === "under_review").length;

    const deposits = await ctx.db.query("deposits").collect();
    const totalDeposited = deposits.filter((d) => d.status === "credited").reduce((s, d) => s + d.amountUsd, 0);
    const pendingDeposits = deposits.filter((d) => PENDING_DEPOSIT_STATUSES.has(d.status)).length;

    const withdrawals = await ctx.db.query("withdrawals").collect();
    const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((s, w) => s + w.amountUsd, 0);
    const pendingWithdrawals = withdrawals.filter((w) => PENDING_WITHDRAWAL_STATUSES.has(w.status)).length;

    const investments = await ctx.db.query("investments").collect();
    const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
    const activeInvestments = investments.filter((i) => i.status === "active" || i.status === "maturing").length;
    const completedInvestments = investments.filter((i) => i.status === "completed").length;
    const totalAccruedProfit = investments.reduce((s, i) => s + i.accruedProfit, 0);

    const referralEarnings = await ctx.db.query("referralEarnings").collect();

    return {
      totalUsers,
      verifiedUsers,
      pendingKyc,
      totalDeposited,
      pendingDeposits,
      totalWithdrawn,
      pendingWithdrawals,
      totalInvested,
      activeInvestments,
      completedInvestments,
      totalAccruedProfit,
      referralCount: referralEarnings.length,
      totalReferralEarnings: referralEarnings.reduce((s, r) => s + r.amount, 0),
    };
  },
});

export const depositsVsWithdrawalsTrend = query({
  args: { sessionToken: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);
    const since = args.now - TREND_WINDOW_MS;

    const deposits = await ctx.db
      .query("deposits")
      .withIndex("by_status", (q) => q.eq("status", "credited"))
      .collect();
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const byDate = new Map<string, { deposits: number; withdrawals: number }>();
    for (const d of deposits) {
      if (d.createdAt < since) continue;
      const key = dateKey(d.createdAt);
      const row = byDate.get(key) ?? { deposits: 0, withdrawals: 0 };
      row.deposits += d.amountUsd;
      byDate.set(key, row);
    }
    for (const w of withdrawals) {
      const completedAt = w.completedAt ?? w.createdAt;
      if (completedAt < since) continue;
      const key = dateKey(completedAt);
      const row = byDate.get(key) ?? { deposits: 0, withdrawals: 0 };
      row.withdrawals += w.amountUsd;
      byDate.set(key, row);
    }

    return Array.from(byDate.entries())
      .map(([date, totals]) => ({ date, ...totals }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const investmentsByPlan = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);
    const investments = await ctx.db.query("investments").collect();
    const plans = await ctx.db.query("investmentPlans").collect();
    const planNameById = new Map(plans.map((p) => [p._id, p.name]));

    const byPlan = new Map<string, { count: number; amount: number }>();
    for (const inv of investments) {
      const name = planNameById.get(inv.planId) ?? "Unknown plan";
      const row = byPlan.get(name) ?? { count: 0, amount: 0 };
      row.count += 1;
      row.amount += inv.amount;
      byPlan.set(name, row);
    }

    return Array.from(byPlan.entries()).map(([plan, totals]) => ({ plan, ...totals }));
  },
});

export const recentActivity = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);
    const transactions = await ctx.db.query("transactions").order("desc").take(20);
    return await Promise.all(
      transactions.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user" };
      })
    );
  },
});
