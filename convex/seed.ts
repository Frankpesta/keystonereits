import { internalMutation } from "./_generated/server";
import { hashPassword } from "./lib/password";
import { randomReferralCode } from "./lib/crypto";
import {
  CRYPTO_DEPOSIT_OPTIONS_KEY,
  PLATFORM_CONFIG_KEY,
  DEFAULT_PLATFORM_CONFIG,
  type CryptoDepositOption,
} from "./settings";
import { writeTransaction } from "./lib/ledger";
import { DAY_MS, WEEK_MS, dateKey } from "./lib/time";

/**
 * Dev-only seed data for manual QA across every later phase. Run with:
 *   npx convex run seed:seedDatabase
 * Safe to re-run — each section checks for existing rows before inserting.
 */

const SEED_ADMIN_EMAIL = "admin@keystonereits.com";
const SEED_ADMIN_PASSWORD = "ChangeMe123!";
const SEED_USER_EMAIL = "demo@keystonereits.com";
const SEED_USER_PASSWORD = "ChangeMe123!";
const DEMO_USER_STARTING_BALANCE = 5_000;
const PLAN_DURATION_DAYS = 365;

// Minimum participation + weekly ROI from docs/09-marketing-site-copy.md §8.
const SEED_PLANS = [
  {
    name: "Foundation",
    description:
      "A simple start to real estate participation. The Foundation Plan provides an accessible entry point for individuals looking to participate in professionally managed real estate with a starting amount of $200.",
    minAmount: 200,
    maxAmount: 9_999,
    weeklyReturnPercent: 4,
  },
  {
    name: "Growth",
    description:
      "Step up your real estate participation. The Growth Plan is designed for participants looking to commit a higher level of capital while participating in the same professionally managed real estate model.",
    minAmount: 10_000,
    maxAmount: 49_999,
    weeklyReturnPercent: 5,
  },
  {
    name: "Premium",
    description:
      "Greater participation. Greater exposure. The Premium Plan is designed for participants seeking a larger level of participation in Keystone REIT's real estate model.",
    minAmount: 50_000,
    maxAmount: 99_999,
    weeklyReturnPercent: 6,
  },
  {
    name: "Elite",
    description:
      "Our highest level of participation. The Elite Plan is designed for participants seeking Keystone REIT's highest available plan level and corresponding weekly ROI.",
    minAmount: 100_000,
    maxAmount: 1_000_000,
    weeklyReturnPercent: 8,
  },
] as const;

// Placeholder receiving addresses — clearly demo values, not real wallets.
// Replace with Keystone REIT's actual receiving addresses via the Phase 6
// admin settings screen before accepting real deposits.
const CRYPTO_DEPOSIT_OPTIONS: CryptoDepositOption[] = [
  {
    currency: "USDT",
    network: "TRC20",
    address: "TDemoKeystoneReitUSDTTRC20Addr1111111",
    note: "Fastest confirmation, lowest network fees.",
  },
  {
    currency: "USDT",
    network: "ERC20",
    address: "0xDeM0KeystoneReitUSDTERC20Address00001",
  },
  {
    currency: "BTC",
    network: "Bitcoin",
    address: "bc1qdem0keystonereitbtcaddressplaceholder0",
  },
  {
    currency: "ETH",
    network: "ERC20",
    address: "0xDeM0KeystoneReitETHAddress000000000002",
  },
];

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const summary = {
      admin: "already existed",
      plansCreated: [] as string[],
      user: "already existed",
      cryptoDepositOptions: "already existed",
      platformConfig: "already existed",
      qaData: "already existed",
    };

    const existingCryptoOptions = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", CRYPTO_DEPOSIT_OPTIONS_KEY))
      .unique();
    if (!existingCryptoOptions) {
      await ctx.db.insert("settings", {
        key: CRYPTO_DEPOSIT_OPTIONS_KEY,
        value: CRYPTO_DEPOSIT_OPTIONS,
      });
      summary.cryptoDepositOptions = `created (${CRYPTO_DEPOSIT_OPTIONS.length} options)`;
    }

    const existingPlatformConfig = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", PLATFORM_CONFIG_KEY))
      .unique();
    if (!existingPlatformConfig) {
      await ctx.db.insert("settings", { key: PLATFORM_CONFIG_KEY, value: DEFAULT_PLATFORM_CONFIG });
      summary.platformConfig = "created (defaults)";
    }

    let admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", SEED_ADMIN_EMAIL))
      .unique();
    if (!admin) {
      const adminId = await ctx.db.insert("admins", {
        email: SEED_ADMIN_EMAIL,
        passwordHash: await hashPassword(SEED_ADMIN_PASSWORD),
        name: "Keystone Super Admin",
        role: "super",
        status: "active",
        createdAt: now,
      });
      admin = await ctx.db.get(adminId);
      summary.admin = `created (${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD})`;
    }
    if (!admin) throw new Error("Failed to create or load seed admin");

    const existingPlans = await ctx.db.query("investmentPlans").collect();
    const existingPlanNames = new Set(existingPlans.map((p) => p.name));
    for (const plan of SEED_PLANS) {
      if (existingPlanNames.has(plan.name)) continue;
      await ctx.db.insert("investmentPlans", {
        name: plan.name,
        description: plan.description,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        durationDays: PLAN_DURATION_DAYS,
        weeklyReturnPercent: plan.weeklyReturnPercent,
        accrualFrequency: "weekly",
        status: "active",
        createdBy: admin._id,
        createdAt: now,
      });
      summary.plansCreated.push(plan.name);
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", SEED_USER_EMAIL))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: SEED_USER_EMAIL,
        passwordHash: await hashPassword(SEED_USER_PASSWORD),
        firstName: "Demo",
        lastName: "Investor",
        emailVerified: true,
        status: "active",
        kycStatus: "approved",
        referralCode: randomReferralCode(),
        createdAt: now,
      });
      user = await ctx.db.get(userId);
      if (!user) throw new Error("Failed to create seed user");
      await ctx.db.insert("balances", {
        userId: user._id,
        available: DEMO_USER_STARTING_BALANCE,
        invested: 0,
        profit: 0,
        updatedAt: now,
      });
      summary.user = `created (${SEED_USER_EMAIL} / ${SEED_USER_PASSWORD}), funded with $${DEMO_USER_STARTING_BALANCE} available`;
    }

    // QA fixtures for Phase 5 manual verification (docs/05-user-dashboard.md's
    // Definition of Done explicitly calls for a seeded investment ~40%
    // elapsed to check the progress visualization). Gated on the user having
    // no investments yet so this section only ever runs once.
    const existingInvestments = await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    if (existingInvestments.length === 0) {
      const allPlans = await ctx.db.query("investmentPlans").collect();
      const foundationPlan = allPlans.find((p) => p.name === "Foundation");
      if (!foundationPlan) throw new Error("Foundation plan not found — seed plans first");

      const balance = await ctx.db
        .query("balances")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      if (!balance) throw new Error("Seed user has no balances row");

      // Investment ~40% through its 365-day duration.
      const elapsedDays = Math.round(foundationPlan.durationDays * 0.4);
      const investmentAmount = 1_000;
      const startDate = now - elapsedDays * DAY_MS;
      const maturityDate = startDate + foundationPlan.durationDays * DAY_MS;
      const weeklyAccrualAmount = Math.round(
        investmentAmount * (foundationPlan.weeklyReturnPercent / 100) * 100
      ) / 100;
      const accrualWeeksSeeded = 5;
      const seededProfit = Math.round(weeklyAccrualAmount * accrualWeeksSeeded * 100) / 100;

      const investmentId = await ctx.db.insert("investments", {
        userId: user._id,
        planId: foundationPlan._id,
        amount: investmentAmount,
        startDate,
        maturityDate,
        accruedProfit: seededProfit,
        status: "active",
        lastAccrualAt: now,
        createdAt: startDate,
      });
      await writeTransaction(ctx, {
        userId: user._id,
        type: "investment",
        amount: investmentAmount,
        status: "completed",
        relatedId: investmentId,
      });

      for (let i = 0; i < accrualWeeksSeeded; i++) {
        await ctx.db.insert("profitAccruals", {
          userId: user._id,
          investmentId,
          planId: foundationPlan._id,
          amount: weeklyAccrualAmount,
          accrualDate: dateKey(now - i * WEEK_MS),
        });
      }

      // A credited crypto deposit.
      const depositId = await ctx.db.insert("deposits", {
        userId: user._id,
        method: "crypto",
        amountUsd: 500,
        currency: "USDT",
        network: "TRC20",
        txHash: "seed-demo-deposit-tx-1",
        status: "credited",
        verifiedBy: admin._id,
        verifiedAt: now,
        createdAt: now - 2 * DAY_MS,
      });
      await writeTransaction(ctx, {
        userId: user._id,
        type: "deposit",
        amount: 500,
        status: "credited",
        relatedId: depositId,
      });

      // A pending withdrawal request, to demo earmarking on the withdraw page.
      const withdrawalId = await ctx.db.insert("withdrawals", {
        userId: user._id,
        balanceSource: "available",
        amountUsd: 200,
        walletAddress: "TDemoWithdrawDestinationAddr1",
        network: "TRC20",
        status: "pending",
        createdAt: now - DAY_MS,
      });
      await writeTransaction(ctx, {
        userId: user._id,
        type: "withdrawal",
        amount: 200,
        status: "pending",
        relatedId: withdrawalId,
      });

      await ctx.db.patch(balance._id, {
        available: balance.available + 500,
        invested: balance.invested + investmentAmount,
        profit: balance.profit + seededProfit,
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "kyc_approved",
        title: "KYC Approved",
        body: "Your identity verification was approved.",
        read: true,
        createdAt: now - 3 * DAY_MS,
      });
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "deposit_credited",
        title: "Deposit Credited",
        body: "Your $500 USDT deposit has been credited to your available balance.",
        read: false,
        createdAt: now - 2 * DAY_MS,
      });

      const ticketId = await ctx.db.insert("supportTickets", {
        userId: user._id,
        subject: "Question about withdrawal timing",
        category: "withdrawal",
        status: "open",
        createdAt: now - DAY_MS,
        updatedAt: now - DAY_MS,
      });
      await ctx.db.insert("supportMessages", {
        ticketId,
        authorType: "user",
        authorId: user._id,
        body: "Hi, how long does a TRC20 withdrawal usually take to process?",
        createdAt: now - DAY_MS,
      });

      summary.qaData = `created (1 investment ~40% elapsed, ${accrualWeeksSeeded} accrual rows, 1 credited deposit, 1 pending withdrawal, 2 notifications, 1 support ticket)`;
    }

    return summary;
  },
});
