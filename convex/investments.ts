import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/auth";
import { writeTransaction } from "./lib/ledger";
import { returnPrincipalToAvailable, getLowestActivePlanMinAmount, planRequiresKyc } from "./lib/investments";
import { DAY_MS, WEEK_MS, dateKey } from "./lib/time";
import { notifyAdminsByRole } from "./lib/notify";
import type { Doc } from "./_generated/dataModel";

const INVESTMENT_NOTIFY_ROLES: Doc<"admins">["role"][] = ["super", "investment"];

export const invest = mutation({
  args: {
    sessionToken: v.string(),
    planId: v.id("investmentPlans"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.status !== "active") {
      throw new ConvexError("This plan is not currently available.");
    }

    const lowestActiveMinAmount = await getLowestActivePlanMinAmount(ctx);
    if (planRequiresKyc(plan, lowestActiveMinAmount) && user.kycStatus !== "approved") {
      throw new ConvexError("Complete KYC verification before investing in this plan.");
    }

    if (!Number.isFinite(args.amount) || args.amount < plan.minAmount || args.amount > plan.maxAmount) {
      throw new ConvexError(
        `Enter an amount between $${plan.minAmount.toLocaleString()} and $${plan.maxAmount.toLocaleString()}.`
      );
    }

    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    const available = balance?.available ?? 0;
    if (args.amount > available) {
      throw new ConvexError("Insufficient available balance for this investment.");
    }

    const now = Date.now();
    if (balance) {
      await ctx.db.patch(balance._id, {
        available: balance.available - args.amount,
        invested: balance.invested + args.amount,
        updatedAt: now,
      });
    }

    const investmentId = await ctx.db.insert("investments", {
      userId: user._id,
      planId: plan._id,
      amount: args.amount,
      startDate: now,
      maturityDate: now + plan.durationDays * DAY_MS,
      accruedProfit: 0,
      status: "active",
      createdAt: now,
    });

    await writeTransaction(ctx, {
      userId: user._id,
      type: "investment",
      amount: args.amount,
      status: "completed",
      relatedId: investmentId,
    });
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "investment_created",
      title: "Investment Confirmed",
      body: `Your investment of $${args.amount.toLocaleString()} in the ${plan.name} plan is now active.`,
      read: false,
      createdAt: now,
    });
    await notifyAdminsByRole(ctx, {
      roles: INVESTMENT_NOTIFY_ROLES,
      type: "admin_investment_created",
      title: "New Investment",
      body: `${user.firstName} ${user.lastName} invested $${args.amount.toLocaleString()} in the ${plan.name} plan.`,
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendInvestmentCreatedEmail, {
      to: user.email,
      firstName: user.firstName,
      planName: plan.name,
      amountUsd: args.amount,
      maturityDate: new Date(now + plan.durationDays * DAY_MS).toUTCString(),
      userId: user._id,
    });

    return { ok: true as const, investmentId };
  },
});

export const myInvestments = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);

    return await Promise.all(
      investments.map(async (investment) => {
        const plan = await ctx.db.get(investment.planId);
        return { ...investment, plan };
      })
    );
  },
});

export const myInvestment = query({
  args: { sessionToken: v.string(), investmentId: v.id("investments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const investment = await ctx.db.get(args.investmentId);
    if (!investment || investment.userId !== user._id) {
      throw new ConvexError("Investment not found.");
    }
    const plan = await ctx.db.get(investment.planId);
    return { ...investment, plan };
  },
});

/**
 * Runs weekly via convex/crons.ts. Scans every `active` investment — this
 * intentionally excludes pending/admin_paused/admin_ended/completed/cancelled,
 * so a paused or ended investment simply stops accruing until (if ever)
 * restarted. Single-transaction scan, same dev/MVP-scale tradeoff noted in
 * convex/admin/dashboard.ts — reach for batched scheduler continuations if
 * the active-investment count ever approaches Convex's per-mutation limits.
 */
export const accrueWeeklyProfit = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let accruedCount = 0;
    for (const investment of investments) {
      // Idempotency: a cron re-run (or manual trigger) within the same week must not double-credit.
      if (investment.lastAccrualAt && now - investment.lastAccrualAt < WEEK_MS) continue;

      const plan = await ctx.db.get(investment.planId);
      if (!plan) continue;

      const amount = Math.round(investment.amount * (plan.weeklyReturnPercent / 100) * 100) / 100;
      if (amount <= 0) continue;

      await ctx.db.insert("profitAccruals", {
        userId: investment.userId,
        investmentId: investment._id,
        planId: plan._id,
        amount,
        accrualDate: dateKey(now),
      });
      await ctx.db.patch(investment._id, {
        accruedProfit: investment.accruedProfit + amount,
        lastAccrualAt: now,
      });

      const balance = await ctx.db
        .query("balances")
        .withIndex("by_user", (q) => q.eq("userId", investment.userId))
        .unique();
      if (balance) {
        await ctx.db.patch(balance._id, { profit: balance.profit + amount, updatedAt: now });
      }

      await writeTransaction(ctx, {
        userId: investment.userId,
        type: "profit_accrual",
        amount,
        status: "completed",
        relatedId: investment._id,
      });

      accruedCount++;
    }

    return { accruedCount, scanned: investments.length };
  },
});

/**
 * Runs daily via convex/crons.ts (independent of accrueWeeklyProfit's
 * weekly schedule, since maturities can land on any day). Matures
 * investments whose term has ended and returns principal — see
 * returnPrincipalToAvailable's docstring for the policy this implements.
 */
export const processMaturities = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const candidates = await Promise.all(
      (["active", "maturing"] as const).map((status) =>
        ctx.db
          .query("investments")
          .withIndex("by_status", (q) => q.eq("status", status))
          .collect()
      )
    );
    const matured = candidates.flat().filter((inv) => inv.maturityDate <= now);

    for (const investment of matured) {
      await ctx.db.patch(investment._id, { status: "completed" });
      await returnPrincipalToAvailable(ctx, investment);

      const [user, plan] = await Promise.all([ctx.db.get(investment.userId), ctx.db.get(investment.planId)]);
      if (user) {
        await ctx.db.insert("notifications", {
          userId: investment.userId,
          type: "investment_completed",
          title: "Investment Matured",
          body: `Your ${plan?.name ?? "investment"} has matured. Your principal of $${investment.amount.toLocaleString()} has been returned to your available balance.`,
          read: false,
          createdAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.emailActions.sendInvestmentCompletedEmail, {
          to: user.email,
          firstName: user.firstName,
          planName: plan?.name ?? "Investment",
          amountUsd: investment.amount,
          accruedProfit: investment.accruedProfit,
          userId: user._id,
        });
      }
    }

    return { maturedCount: matured.length };
  },
});
