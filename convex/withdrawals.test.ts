// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";

describe("withdrawals.request", () => {
  it("creates a pending withdrawal and a matching transaction", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t, { available: 1000 });

    const result = await t.mutation(api.withdrawals.request, {
      sessionToken,
      balanceSource: "available",
      amountUsd: 400,
      walletAddress: "Taddr123",
      network: "TRC20",
    });
    expect(result.ok).toBe(true);

    const rows = await t.run((ctx) => ctx.db.query("withdrawals").collect());
    expect(rows).toMatchObject([{ userId: user._id, amountUsd: 400, status: "pending" }]);

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "withdrawal", amount: 400, status: "pending" }]);

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "withdrawal_pending" }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("rejects a request exceeding the available balance", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { available: 100 });

    await expect(
      t.mutation(api.withdrawals.request, {
        sessionToken,
        balanceSource: "available",
        amountUsd: 500,
        walletAddress: "Taddr123",
        network: "TRC20",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("prevents double-spending the same balance across two overlapping requests", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { available: 1000 });

    // First request earmarks 700, leaving 300 available.
    await t.mutation(api.withdrawals.request, {
      sessionToken,
      balanceSource: "available",
      amountUsd: 700,
      walletAddress: "Taddr123",
      network: "TRC20",
    });

    // A second request for 500 would double-spend the same $1000 — must be rejected.
    await expect(
      t.mutation(api.withdrawals.request, {
        sessionToken,
        balanceSource: "available",
        amountUsd: 500,
        walletAddress: "Taddr456",
        network: "TRC20",
      })
    ).rejects.toThrow(ConvexError);

    // But a request within the remaining 300 still succeeds.
    const result = await t.mutation(api.withdrawals.request, {
      sessionToken,
      balanceSource: "available",
      amountUsd: 300,
      walletAddress: "Taddr456",
      network: "TRC20",
    });
    expect(result.ok).toBe(true);
  });

  it("tracks available and profit balances independently", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { available: 100, profit: 200 });

    await t.mutation(api.withdrawals.request, {
      sessionToken,
      balanceSource: "profit",
      amountUsd: 200,
      walletAddress: "Taddr123",
      network: "TRC20",
    });

    // available balance is untouched by the profit-sourced request
    await expect(
      t.mutation(api.withdrawals.request, {
        sessionToken,
        balanceSource: "available",
        amountUsd: 100,
        walletAddress: "Taddr123",
        network: "TRC20",
      })
    ).resolves.toMatchObject({ ok: true });
  });

  it("does not decrement the real balance at request time (earmarking only)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t, { available: 1000 });

    await t.mutation(api.withdrawals.request, {
      sessionToken,
      balanceSource: "available",
      amountUsd: 400,
      walletAddress: "Taddr123",
      network: "TRC20",
    });

    const balance = await t.run((ctx) =>
      ctx.db
        .query("balances")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique()
    );
    expect(balance?.available).toBe(1000);
  });
});
