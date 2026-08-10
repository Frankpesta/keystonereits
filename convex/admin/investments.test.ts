// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import { DAY_MS } from "../lib/time";
import type { Id } from "../_generated/dataModel";

async function seedInvestment(t: ReturnType<typeof convexTest>, adminId: Id<"admins">, userId: Id<"users">) {
  const planId = await t.run((ctx) =>
    ctx.db.insert("investmentPlans", {
      name: "Foundation",
      description: "desc",
      minAmount: 200,
      maxAmount: 10_000,
      durationDays: 365,
      dailyReturnPercent: 4 / 7,
      accrualFrequency: "daily",
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
      startDate: Date.now(),
      maturityDate: Date.now() + 365 * DAY_MS,
      accruedProfit: 20,
      status: "active",
      createdAt: Date.now(),
    })
  );
  return investmentId;
}

describe("admin/investments.pause/end/restart", () => {
  it("pause moves active -> admin_paused and records an override + notification + audit log", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const { user } = await createVerifiedUser(t);
    const investmentId = await seedInvestment(t, admin._id, user._id);

    await t.mutation(api.admin.investments.pause, { sessionToken, investmentId, reason: "Suspicious deposit under review." });

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.status).toBe("admin_paused");

    const overrides = await t.run((ctx) => ctx.db.query("investmentOverrides").collect());
    expect(overrides).toMatchObject([{ action: "pause", performedBy: admin._id }]);

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "investment_pause" }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ action: "investment_pause" }]);
  });

  it("restart only works from admin_paused", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const { user } = await createVerifiedUser(t);
    const investmentId = await seedInvestment(t, admin._id, user._id);

    await expect(
      t.mutation(api.admin.investments.restart, { sessionToken, investmentId, reason: "test" })
    ).rejects.toThrow(ConvexError);

    await t.mutation(api.admin.investments.pause, { sessionToken, investmentId, reason: "test" });
    await t.mutation(api.admin.investments.restart, { sessionToken, investmentId, reason: "Cleared review." });

    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.status).toBe("active");
  });

  it("end works from active or admin_paused, and requires a reason", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const { user } = await createVerifiedUser(t);
    const investmentId = await seedInvestment(t, admin._id, user._id);

    await expect(
      t.mutation(api.admin.investments.end, { sessionToken, investmentId, reason: "" })
    ).rejects.toThrow(ConvexError);

    await t.mutation(api.admin.investments.end, { sessionToken, investmentId, reason: "Account closed at user request." });
    const investment = await t.run((ctx) => ctx.db.get(investmentId));
    expect(investment?.status).toBe("admin_ended");
  });

  it("end returns principal to available balance and decrements invested", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const { user } = await createVerifiedUser(t, { available: 0, invested: 1000 });
    const investmentId = await seedInvestment(t, admin._id, user._id);

    await t.mutation(api.admin.investments.end, { sessionToken, investmentId, reason: "test" });

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance).toMatchObject({ available: 1000, invested: 0 });

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "investment", amount: 1000, status: "principal_returned" }]);
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin: seedAdmin } = await createAdmin(t, { role: "investment" });
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t);
    const investmentId = await seedInvestment(t, seedAdmin._id, user._id);

    await expect(
      t.mutation(api.admin.investments.pause, { sessionToken, investmentId, reason: "test" })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/investments.list + detail", () => {
  it("filters by search term across investor name/email", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const ada = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    await seedInvestment(t, admin._id, ada.user._id);

    const results = await t.query(api.admin.investments.list, { sessionToken, search: "ada" });
    expect(results).toHaveLength(1);
    expect(results[0].userName).toBe("Ada Lovelace");
  });

  it("detail includes override history", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "investment" });
    const { user } = await createVerifiedUser(t);
    const investmentId = await seedInvestment(t, admin._id, user._id);
    await t.mutation(api.admin.investments.pause, { sessionToken, investmentId, reason: "test" });

    const detail = await t.query(api.admin.investments.detail, { sessionToken, investmentId });
    expect(detail.overrides).toHaveLength(1);
    expect(detail.plan?.name).toBe("Foundation");
  });
});
