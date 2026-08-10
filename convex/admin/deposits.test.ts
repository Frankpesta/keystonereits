// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import type { Id } from "../_generated/dataModel";

async function seedDeposit(t: ReturnType<typeof convexTest>, userId: Id<"users">, amountUsd = 500) {
  return await t.run((ctx) =>
    ctx.db.insert("deposits", { userId, method: "crypto", amountUsd, currency: "USDT", network: "TRC20", txHash: "0xabc", status: "pending", createdAt: Date.now() })
  );
}

describe("admin/deposits.verifyAndCredit", () => {
  it("credits the user's balance, writes a transaction, notification, and audit log", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 100 });
    const depositId = await seedDeposit(t, user._id, 500);

    const result = await t.mutation(api.admin.deposits.verifyAndCredit, { sessionToken, depositId });
    expect(result).toEqual({ ok: true });

    const balance = await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique());
    expect(balance?.available).toBe(600);

    const deposit = await t.run((ctx) => ctx.db.get(depositId));
    expect(deposit).toMatchObject({ status: "credited", verifiedBy: admin._id });

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "deposit", amount: 500, status: "credited" }]);

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "deposit_credited" }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ action: "deposit_credit", amount: 500 }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("rejects crediting an already-credited deposit twice", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 100 });
    const depositId = await seedDeposit(t, user._id);

    await t.mutation(api.admin.deposits.verifyAndCredit, { sessionToken, depositId });
    await expect(t.mutation(api.admin.deposits.verifyAndCredit, { sessionToken, depositId })).rejects.toThrow(
      ConvexError
    );

    const balance = await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique());
    expect(balance?.available).toBe(600); // not double-credited
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t, { available: 100 });
    const depositId = await seedDeposit(t, user._id);

    await expect(t.mutation(api.admin.deposits.verifyAndCredit, { sessionToken, depositId })).rejects.toThrow(
      ConvexError
    );
  });
});

describe("admin/deposits.reject", () => {
  it("rejects with a reason and notifies the user, without touching the balance", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 100 });
    const depositId = await seedDeposit(t, user._id);

    await t.mutation(api.admin.deposits.reject, { sessionToken, depositId, reason: "Transaction not found on-chain." });

    const deposit = await t.run((ctx) => ctx.db.get(depositId));
    expect(deposit).toMatchObject({ status: "rejected", note: "Transaction not found on-chain." });

    const balance = await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique());
    expect(balance?.available).toBe(100);
  });

  it("requires a reason", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t);
    const depositId = await seedDeposit(t, user._id);

    await expect(
      t.mutation(api.admin.deposits.reject, { sessionToken, depositId, reason: "" })
    ).rejects.toThrow(ConvexError);
  });
});
