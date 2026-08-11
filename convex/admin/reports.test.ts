// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import { DAY_MS } from "../lib/time";

describe("admin/reports.userReport", () => {
  it("filters by kycStatus and date range", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "compliance" });
    const approved = await createVerifiedUser(t, { kycStatus: "approved", available: 500 });
    await createVerifiedUser(t, { kycStatus: "not_started" });
    await t.run((ctx) => ctx.db.patch(approved.user._id, { createdAt: Date.now() - 10 * DAY_MS }));

    const report = await t.query(api.admin.reports.userReport, { sessionToken, kycStatus: "approved" });
    expect(report).toHaveLength(1);
    expect(report[0]).toMatchObject({ email: approved.user.email, available: 500 });

    const dateFiltered = await t.query(api.admin.reports.userReport, {
      sessionToken,
      kycStatus: "approved",
      fromDate: Date.now() - 1 * DAY_MS,
    });
    expect(dateFiltered).toHaveLength(0);
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    await expect(t.query(api.admin.reports.userReport, { sessionToken })).rejects.toThrow(ConvexError);
  });
});

describe("admin/reports.financialReport", () => {
  it("filters transactions by type and status", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t);

    await t.run((ctx) => ctx.db.insert("transactions", { userId: user._id, type: "deposit", amount: 100, status: "credited", createdAt: Date.now() }));
    await t.run((ctx) => ctx.db.insert("transactions", { userId: user._id, type: "withdrawal", amount: 50, status: "pending", createdAt: Date.now() }));

    const report = await t.query(api.admin.reports.financialReport, { sessionToken, type: "deposit" });
    expect(report).toHaveLength(1);
    expect(report[0].userName).toBe(`${user.firstName} ${user.lastName}`);
  });
});

describe("admin/reports.investmentReport", () => {
  it("filters investments by plan and status", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t);
    const planId = await t.run((ctx) =>
      ctx.db.insert("investmentPlans", {
        name: "Foundation",
        description: "desc",
        minAmount: 200,
        maxAmount: 10_000,
        durationDays: 365,
        weeklyReturnPercent: 3.5,
        accrualFrequency: "weekly",
        status: "active",
        createdBy: admin._id,
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("investments", { userId: user._id, planId, amount: 1000, startDate: Date.now(), maturityDate: Date.now() + DAY_MS, accruedProfit: 0, status: "active", createdAt: Date.now() })
    );

    const report = await t.query(api.admin.reports.investmentReport, { sessionToken, planId });
    expect(report).toHaveLength(1);
    expect(report[0].planName).toBe("Foundation");
  });
});
