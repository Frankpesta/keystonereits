// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { logAdminAction } from "./audit";

async function seedAdmin(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) =>
    ctx.db.insert("admins", {
      email: "audit-admin@keystonereits.com",
      passwordHash: "irrelevant-for-this-test",
      name: "Audit Admin",
      role: "super",
      status: "active",
      createdAt: Date.now(),
    })
  );
}

describe("logAdminAction", () => {
  it("inserts a fully-populated auditLogs row", async () => {
    const t = convexTest(schema, convexTestModules);
    const adminId = await seedAdmin(t);

    await t.run((ctx) =>
      logAdminAction(ctx, {
        adminId,
        action: "deposit.credit",
        targetType: "deposits",
        targetId: "some-deposit-id",
        amount: 500,
        before: { status: "pending" },
        after: { status: "credited" },
      })
    );

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      adminId,
      action: "deposit.credit",
      targetType: "deposits",
      targetId: "some-deposit-id",
      amount: 500,
      before: { status: "pending" },
      after: { status: "credited" },
    });
    expect(typeof logs[0].createdAt).toBe("number");
  });

  it("allows omitting amount/before/after for non-monetary actions", async () => {
    const t = convexTest(schema, convexTestModules);
    const adminId = await seedAdmin(t);

    await t.run((ctx) =>
      logAdminAction(ctx, {
        adminId,
        action: "user.suspend",
        targetType: "users",
        targetId: "some-user-id",
      })
    );

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs[0].amount).toBeUndefined();
    expect(logs[0].before).toBeUndefined();
    expect(logs[0].after).toBeUndefined();
  });

  it("records each call as a separate row rather than overwriting", async () => {
    const t = convexTest(schema, convexTestModules);
    const adminId = await seedAdmin(t);

    for (let i = 0; i < 3; i++) {
      await t.run((ctx) =>
        logAdminAction(ctx, {
          adminId,
          action: `action-${i}`,
          targetType: "users",
          targetId: "same-target",
        })
      );
    }

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toHaveLength(3);
  });
});
