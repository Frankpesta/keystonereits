// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import { DAY_MS, dateKey } from "./lib/time";
import type { Id } from "./_generated/dataModel";

async function seedInvestment(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
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
  const planId = await t.run((ctx) =>
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
  const investmentId = await t.run((ctx) =>
    ctx.db.insert("investments", {
      userId,
      planId,
      amount: 1000,
      startDate: Date.now() - 5 * DAY_MS,
      maturityDate: Date.now() + 360 * DAY_MS,
      accruedProfit: 20,
      status: "active",
      createdAt: Date.now() - 5 * DAY_MS,
    })
  );
  return { planId, investmentId };
}

describe("profitAccruals", () => {
  it("chartSeries sums same-day accruals across investments and sorts ascending", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const { planId, investmentId } = await seedInvestment(t, user._id);

    const today = dateKey(Date.now());
    const yesterday = dateKey(Date.now() - DAY_MS);

    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: user._id,
        investmentId,
        planId,
        amount: 5,
        accrualDate: yesterday,
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: user._id,
        investmentId,
        planId,
        amount: 3,
        accrualDate: today,
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: user._id,
        investmentId,
        planId,
        amount: 2,
        accrualDate: today,
      })
    );

    const series = await t.query(api.profitAccruals.chartSeries, { sessionToken });
    expect(series).toEqual([
      { date: yesterday, amount: 5 },
      { date: today, amount: 5 },
    ]);
  });

  it("totalEarned sums every accrual row for the user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const { planId, investmentId } = await seedInvestment(t, user._id);

    for (let i = 0; i < 3; i++) {
      await t.run((ctx) =>
        ctx.db.insert("profitAccruals", {
          userId: user._id,
          investmentId,
          planId,
          amount: 10,
          accrualDate: dateKey(Date.now() - i * DAY_MS),
        })
      );
    }

    expect(await t.query(api.profitAccruals.totalEarned, { sessionToken })).toBe(30);
  });

  it("history paginates and joins the plan", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const { planId, investmentId } = await seedInvestment(t, user._id);

    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: user._id,
        investmentId,
        planId,
        amount: 7,
        accrualDate: dateKey(Date.now()),
      })
    );

    const page = await t.query(api.profitAccruals.history, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(page.page).toHaveLength(1);
    expect(page.page[0].plan?.name).toBe("Foundation");
  });

  it("does not leak another user's accruals", async () => {
    const t = convexTest(schema, convexTestModules);
    const a = await createVerifiedUser(t);
    const b = await createVerifiedUser(t);
    const { planId, investmentId } = await seedInvestment(t, a.user._id);
    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: a.user._id,
        investmentId,
        planId,
        amount: 7,
        accrualDate: dateKey(Date.now()),
      })
    );

    expect(await t.query(api.profitAccruals.totalEarned, { sessionToken: b.sessionToken })).toBe(0);
    expect(await t.query(api.profitAccruals.chartSeries, { sessionToken: b.sessionToken })).toEqual([]);
  });
});
