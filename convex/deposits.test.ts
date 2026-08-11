// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser, createAdmin } from "./lib/testHelpers";
import { CRYPTO_DEPOSIT_OPTIONS_KEY } from "./settings";

async function seedCryptoOptions(t: ReturnType<typeof convexTest>) {
  await t.run((ctx) =>
    ctx.db.insert("settings", {
      key: CRYPTO_DEPOSIT_OPTIONS_KEY,
      value: [{ currency: "USDT", network: "TRC20", address: "Taddr" }],
    })
  );
}

async function fakeUpload(t: ReturnType<typeof convexTest>) {
  return await t.run((ctx) => ctx.storage.store(new Blob(["fake proof"], { type: "image/png" })));
}

describe("deposits.submitCrypto", () => {
  it("creates a pending deposit and a matching pending transaction", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken, user } = await createVerifiedUser(t);
    const proofFileId = await fakeUpload(t);

    const result = await t.mutation(api.deposits.submitCrypto, {
      sessionToken,
      amountUsd: 500,
      currency: "USDT",
      network: "TRC20",
      proofFileId,
    });
    expect(result.ok).toBe(true);

    const deposits = await t.run((ctx) => ctx.db.query("deposits").collect());
    expect(deposits).toHaveLength(1);
    expect(deposits[0]).toMatchObject({
      userId: user._id,
      method: "crypto",
      amountUsd: 500,
      status: "pending",
      proofFileId,
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
    const proofFileId = await fakeUpload(t);

    await expect(
      t.mutation(api.deposits.submitCrypto, {
        sessionToken,
        amountUsd: 500,
        currency: "DOGE",
        network: "DogeChain",
        proofFileId,
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-positive amount", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken } = await createVerifiedUser(t);
    const proofFileId = await fakeUpload(t);

    await expect(
      t.mutation(api.deposits.submitCrypto, {
        sessionToken,
        amountUsd: 0,
        currency: "USDT",
        network: "TRC20",
        proofFileId,
      })
    ).rejects.toThrow(ConvexError);
  });

  it("notifies finance/super admins but not other roles", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedCryptoOptions(t);
    const { sessionToken } = await createVerifiedUser(t);
    const proofFileId = await fakeUpload(t);

    const { admin: financeAdmin } = await createAdmin(t, { role: "finance" });
    const { admin: marketingAdmin } = await createAdmin(t, { role: "marketing" });

    await t.mutation(api.deposits.submitCrypto, {
      sessionToken,
      amountUsd: 500,
      currency: "USDT",
      network: "TRC20",
      proofFileId,
    });

    const adminNotifications = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_admin", (q) => q.eq("adminId", financeAdmin._id)).collect()
    );
    expect(adminNotifications).toMatchObject([{ type: "admin_deposit_submitted" }]);

    const marketingNotifications = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_admin", (q) => q.eq("adminId", marketingAdmin._id)).collect()
    );
    expect(marketingNotifications).toHaveLength(0);
  });
});
