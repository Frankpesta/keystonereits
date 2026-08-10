// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import type { Id } from "./_generated/dataModel";

async function seedPlan(
  t: ReturnType<typeof convexTest>,
  overrides: Partial<{ minAmount: number; maxAmount: number; durationDays: number; status: string }> = {}
): Promise<Id<"investmentPlans">> {
  const adminId = await t.run((ctx) =>
    ctx.db.insert("admins", {
      email: "admin@example.com",
      passwordHash: "x",
      name: "Admin",
      role: "super",
      status: "active",
      createdAt: Date.now(),
    })
  );
  return await t.run((ctx) =>
    ctx.db.insert("investmentPlans", {
      name: "Foundation",
      description: "desc",
      minAmount: overrides.minAmount ?? 200,
      maxAmount: overrides.maxAmount ?? 10_000,
      durationDays: overrides.durationDays ?? 365,
      dailyReturnPercent: 4 / 7,
      accrualFrequency: "daily",
      status: (overrides.status ?? "active") as "active",
      createdBy: adminId,
      createdAt: Date.now(),
    })
  );
}

describe("investments.invest", () => {
  it("decrements available, increments invested, and creates an active investment", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t);
    const { sessionToken, user } = await createVerifiedUser(t, { available: 5000 });

    const result = await t.mutation(api.investments.invest, { sessionToken, planId, amount: 1000 });
    expect(result.ok).toBe(true);

    const balance = await t.run((ctx) =>
      ctx.db
        .query("balances")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique()
    );
    expect(balance).toMatchObject({ available: 4000, invested: 1000 });

    const investments = await t.run((ctx) => ctx.db.query("investments").collect());
    expect(investments).toMatchObject([{ amount: 1000, status: "active", planId }]);
    expect(investments[0].maturityDate - investments[0].startDate).toBe(365 * 24 * 60 * 60 * 1000);

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "investment", amount: 1000, status: "completed" }]);

    const summary = await t.query(api.investments.myInvestments, { sessionToken });
    expect(summary).toHaveLength(1);
    expect(summary[0].plan?.name).toBe("Foundation");

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "investment_created" }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("rejects an amount below the plan minimum", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t, { minAmount: 500 });
    const { sessionToken } = await createVerifiedUser(t, { available: 5000 });

    await expect(
      t.mutation(api.investments.invest, { sessionToken, planId, amount: 100 })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects an amount above the plan maximum", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t, { maxAmount: 1000 });
    const { sessionToken } = await createVerifiedUser(t, { available: 5000 });

    await expect(
      t.mutation(api.investments.invest, { sessionToken, planId, amount: 2000 })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects an amount exceeding available balance", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t);
    const { sessionToken } = await createVerifiedUser(t, { available: 300 });

    await expect(
      t.mutation(api.investments.invest, { sessionToken, planId, amount: 1000 })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects investing into a non-active plan", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t, { status: "paused" });
    const { sessionToken } = await createVerifiedUser(t, { available: 5000 });

    await expect(
      t.mutation(api.investments.invest, { sessionToken, planId, amount: 1000 })
    ).rejects.toThrow(ConvexError);
  });

  it("myInvestment enforces ownership", async () => {
    const t = convexTest(schema, convexTestModules);
    const planId = await seedPlan(t);
    const owner = await createVerifiedUser(t, { available: 5000 });
    const stranger = await createVerifiedUser(t, { available: 5000 });

    const { investmentId } = await t.mutation(api.investments.invest, {
      sessionToken: owner.sessionToken,
      planId,
      amount: 1000,
    });

    await expect(
      t.query(api.investments.myInvestment, {
        sessionToken: stranger.sessionToken,
        investmentId: investmentId as Id<"investments">,
      })
    ).rejects.toThrow(ConvexError);

    const own = await t.query(api.investments.myInvestment, {
      sessionToken: owner.sessionToken,
      investmentId: investmentId as Id<"investments">,
    });
    expect(own.amount).toBe(1000);
  });
});
