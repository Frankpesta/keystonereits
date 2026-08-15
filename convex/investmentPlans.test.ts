// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";

async function seedPlan(
  t: ReturnType<typeof convexTest>,
  overrides: Partial<{ name: string; minAmount: number; maxAmount: number; status: string }> = {}
) {
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
      name: overrides.name ?? "Plan",
      description: "desc",
      minAmount: overrides.minAmount ?? 200,
      maxAmount: overrides.maxAmount ?? 10_000,
      durationDays: 365,
      weeklyReturnPercent: 4,
      accrualFrequency: "weekly",
      status: (overrides.status ?? "active") as "active",
      createdBy: adminId,
      createdAt: Date.now(),
    })
  );
}

describe("investmentPlans.listActive", () => {
  it("flags every plan above the lowest minAmount as requiring KYC", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedPlan(t, { name: "Foundation", minAmount: 200, maxAmount: 9_999 });
    await seedPlan(t, { name: "Growth", minAmount: 10_000, maxAmount: 49_999 });
    await seedPlan(t, { name: "Elite", minAmount: 100_000, maxAmount: 1_000_000 });

    const plans = await t.query(api.investmentPlans.listActive, {});
    expect(plans.map((p) => ({ name: p.name, requiresKyc: p.requiresKyc }))).toEqual([
      { name: "Foundation", requiresKyc: false },
      { name: "Growth", requiresKyc: true },
      { name: "Elite", requiresKyc: true },
    ]);
  });

  it("excludes draft/paused plans from the lowest-plan calculation", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedPlan(t, { name: "Draft-cheap", minAmount: 1, maxAmount: 100, status: "draft" });
    await seedPlan(t, { name: "Foundation", minAmount: 200, maxAmount: 9_999 });

    const plans = await t.query(api.investmentPlans.listActive, {});
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ name: "Foundation", requiresKyc: false });
  });
});
