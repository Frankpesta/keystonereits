// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import { CRYPTO_DEPOSIT_OPTIONS_KEY } from "./settings";

async function seedCryptoOptions(t: ReturnType<typeof convexTest>) {
  await t.run((ctx) =>
    ctx.db.insert("settings", {
      key: CRYPTO_DEPOSIT_OPTIONS_KEY,
      value: [{ currency: "USDT", network: "TRC20", address: "Taddr" }],
    })
  );
}

describe("deposits.submitCrypto", () => {
  it("creates a pending deposit and a matching pending transaction", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken, user } = await createVerifiedUser(t);

    const result = await t.mutation(api.deposits.submitCrypto, {
      sessionToken,
      amountUsd: 500,
      currency: "USDT",
      network: "TRC20",
      txHash: "0xabc123",
    });
    expect(result.ok).toBe(true);

    const deposits = await t.run((ctx) => ctx.db.query("deposits").collect());
    expect(deposits).toHaveLength(1);
    expect(deposits[0]).toMatchObject({
      userId: user._id,
      method: "crypto",
      amountUsd: 500,
      status: "pending",
    });

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({ type: "deposit", amount: 500, status: "pending" });

    const myDeposits = await t.query(api.deposits.myDeposits, { sessionToken });
    expect(myDeposits).toHaveLength(1);
  });

  it("rejects a currency/network pair not in the supported options", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.deposits.submitCrypto, {
        sessionToken,
        amountUsd: 500,
        currency: "DOGE",
        network: "DogeChain",
        txHash: "0xabc123",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-positive amount", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.deposits.submitCrypto, {
        sessionToken,
        amountUsd: 0,
        currency: "USDT",
        network: "TRC20",
        txHash: "0xabc123",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a duplicate tx hash", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken } = await createVerifiedUser(t);

    await t.mutation(api.deposits.submitCrypto, {
      sessionToken,
      amountUsd: 500,
      currency: "USDT",
      network: "TRC20",
      txHash: "0xabc123",
    });

    await expect(
      t.mutation(api.deposits.submitCrypto, {
        sessionToken,
        amountUsd: 100,
        currency: "USDT",
        network: "TRC20",
        txHash: "0xabc123",
      })
    ).rejects.toThrow(ConvexError);
  });
});
