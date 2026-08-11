// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin } from "../lib/testHelpers";

const VALID = {
  name: "Foundation",
  description: "A starter plan.",
  minAmount: 200,
  maxAmount: 9_999,
  durationDays: 365,
  weeklyReturnPercent: 4,
};

describe("admin/investmentPlans.create", () => {
  it("creates a draft plan and logs it", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });

    const result = await t.mutation(api.admin.investmentPlans.create, { sessionToken, ...VALID });
    expect(result.ok).toBe(true);

    const plans = await t.run((ctx) => ctx.db.query("investmentPlans").collect());
    expect(plans).toMatchObject([{ name: "Foundation", status: "draft", createdBy: admin._id }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ action: "investment_plan_create" }]);
  });

  it("rejects maxAmount <= minAmount", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "investment" });

    await expect(
      t.mutation(api.admin.investmentPlans.create, { sessionToken, ...VALID, minAmount: 5000, maxAmount: 1000 })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });

    await expect(t.mutation(api.admin.investmentPlans.create, { sessionToken, ...VALID })).rejects.toThrow(
      ConvexError
    );
  });
});

describe("admin/investmentPlans.update + setStatus", () => {
  it("updates fields and records before/after", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "investment" });
    const { planId } = await t.mutation(api.admin.investmentPlans.create, { sessionToken, ...VALID });

    await t.mutation(api.admin.investmentPlans.update, {
      sessionToken,
      planId,
      ...VALID,
      maxAmount: 15_000,
    });

    const plan = await t.run((ctx) => ctx.db.get(planId));
    expect(plan?.maxAmount).toBe(15_000);
  });

  it("setStatus moves a plan to active", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "investment" });
    const { planId } = await t.mutation(api.admin.investmentPlans.create, { sessionToken, ...VALID });

    await t.mutation(api.admin.investmentPlans.setStatus, { sessionToken, planId, status: "active" });
    const plan = await t.run((ctx) => ctx.db.get(planId));
    expect(plan?.status).toBe("active");

    const publicPlans = await t.query(api.investmentPlans.listActive, {});
    expect(publicPlans).toHaveLength(1);
  });
});
