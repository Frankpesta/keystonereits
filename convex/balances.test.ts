// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";

describe("balances.myBalance", () => {
  it("returns zeroed balances for a brand-new user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    const balance = await t.query(api.balances.myBalance, { sessionToken });
    expect(balance).toMatchObject({
      available: 0,
      invested: 0,
      profit: 0,
      portfolioValue: 0,
      availableToWithdraw: 0,
      profitAvailableToWithdraw: 0,
    });
  });

  it("sums available + invested + profit into portfolioValue", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { available: 1000, invested: 500, profit: 50 });

    const balance = await t.query(api.balances.myBalance, { sessionToken });
    expect(balance.portfolioValue).toBe(1550);
  });

  it("subtracts non-terminal withdrawal requests from availableToWithdraw", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user, sessionToken } = await createVerifiedUser(t, { available: 1000 });

    await t.run((ctx) =>
      ctx.db.insert("withdrawals", {
        userId: user._id,
        balanceSource: "available",
        amountUsd: 400,
        walletAddress: "addr",
        network: "TRC20",
        status: "pending",
        createdAt: Date.now(),
      })
    );

    const balance = await t.query(api.balances.myBalance, { sessionToken });
    expect(balance.availableToWithdraw).toBe(600);
    expect(balance.available).toBe(1000); // real balance untouched until admin completes it
  });

  it("does not earmark terminal (rejected/completed/cancelled) withdrawals", async () => {
    const t = convexTest(schema, convexTestModules);
    const { user, sessionToken } = await createVerifiedUser(t, { available: 1000 });

    for (const status of ["rejected", "completed", "cancelled", "failed"] as const) {
      await t.run((ctx) =>
        ctx.db.insert("withdrawals", {
          userId: user._id,
          balanceSource: "available",
          amountUsd: 400,
          walletAddress: "addr",
          network: "TRC20",
          status,
          createdAt: Date.now(),
        })
      );
    }

    const balance = await t.query(api.balances.myBalance, { sessionToken });
    expect(balance.availableToWithdraw).toBe(1000);
  });

  it("throws for an invalid session token", async () => {
    const t = convexTest(schema, convexTestModules);
    await expect(t.query(api.balances.myBalance, { sessionToken: "bogus" })).rejects.toThrow();
  });
});
