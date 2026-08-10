// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import type { Id } from "../_generated/dataModel";

async function seedWithdrawal(t: ReturnType<typeof convexTest>, userId: Id<"users">, amountUsd = 300) {
  return await t.run((ctx) =>
    ctx.db.insert("withdrawals", {
      userId,
      balanceSource: "available",
      amountUsd,
      walletAddress: "Taddr",
      network: "TRC20",
      status: "pending",
      createdAt: Date.now(),
    })
  );
}

describe("admin/withdrawals pipeline", () => {
  it("walks pending -> approved -> processing -> completed, decrementing the balance only at completion", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id, 300);

    const balanceUnchanged = async () =>
      (await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()))
        ?.available;

    await t.mutation(api.admin.withdrawals.approve, { sessionToken, withdrawalId });
    expect(await balanceUnchanged()).toBe(1000);

    await t.mutation(api.admin.withdrawals.markProcessing, { sessionToken, withdrawalId });
    expect(await balanceUnchanged()).toBe(1000);

    await t.mutation(api.admin.withdrawals.complete, { sessionToken, withdrawalId });
    expect(await balanceUnchanged()).toBe(700);

    const withdrawal = await t.run((ctx) => ctx.db.get(withdrawalId));
    expect(withdrawal).toMatchObject({ status: "completed" });
    expect(withdrawal?.completedAt).toBeTypeOf("number");

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "withdrawal", amount: 300, status: "completed" }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs.map((l) => l.action)).toEqual(["withdrawal_approve", "withdrawal_processing", "withdrawal_complete"]);

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications.map((n) => n.type)).toEqual([
      "withdrawal_approved",
      "withdrawal_processing",
      "withdrawal_completed",
    ]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toHaveLength(3);
    expect(emailLog.every((e) => e.recipientEmail === user.email && e.status === "sent")).toBe(true);
  });

  it("rejects skipping straight from pending to completed", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id);

    await expect(t.mutation(api.admin.withdrawals.complete, { sessionToken, withdrawalId })).rejects.toThrow(
      ConvexError
    );
  });

  it("rejectOrFail requires a reason and does not touch the balance", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id, 300);

    await expect(
      t.mutation(api.admin.withdrawals.rejectOrFail, { sessionToken, withdrawalId, outcome: "rejected", reason: "" })
    ).rejects.toThrow(ConvexError);

    await t.mutation(api.admin.withdrawals.rejectOrFail, {
      sessionToken,
      withdrawalId,
      outcome: "rejected",
      reason: "Wallet address invalid.",
    });

    const withdrawal = await t.run((ctx) => ctx.db.get(withdrawalId));
    expect(withdrawal).toMatchObject({ status: "rejected", reviewNote: "Wallet address invalid." });

    const balance = await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique());
    expect(balance?.available).toBe(1000);
  });

  it("a rejected withdrawal is no longer earmarked (frees up the balance for withdrawal)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken: adminToken } = await createAdmin(t, { role: "finance" });
    const { user, sessionToken: userToken } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id, 900);

    await t.mutation(api.admin.withdrawals.rejectOrFail, {
      sessionToken: adminToken,
      withdrawalId,
      outcome: "rejected",
      reason: "test",
    });

    const balance = await t.query(api.balances.myBalance, { sessionToken: userToken });
    expect(balance.availableToWithdraw).toBe(1000);
  });

  it("refuses to complete if the balance is insufficient at completion time", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id, 900);
    await t.mutation(api.admin.withdrawals.approve, { sessionToken, withdrawalId });

    // Balance drained by something else (e.g. a manual debit) after approval.
    const balance = await t.run((ctx) => ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique());
    await t.run((ctx) => ctx.db.patch(balance!._id, { available: 100 }));

    await expect(t.mutation(api.admin.withdrawals.complete, { sessionToken, withdrawalId })).rejects.toThrow(
      ConvexError
    );
  });

  it("rejects a support-role admin at every stage", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t, { available: 1000 });
    const withdrawalId = await seedWithdrawal(t, user._id);

    await expect(t.mutation(api.admin.withdrawals.approve, { sessionToken, withdrawalId })).rejects.toThrow(
      ConvexError
    );
  });
});
