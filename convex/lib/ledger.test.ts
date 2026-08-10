// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { writeTransaction } from "./ledger";

async function seedUser(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) =>
    ctx.db.insert("users", {
      email: "ledger-user@keystonereits.com",
      passwordHash: "irrelevant-for-this-test",
      firstName: "Ledger",
      lastName: "Tester",
      emailVerified: true,
      status: "active",
      kycStatus: "approved",
      referralCode: "LEDGER01",
      createdAt: Date.now(),
    })
  );
}

describe("writeTransaction", () => {
  it("inserts a transactions row with the given fields", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);

    await t.run((ctx) =>
      writeTransaction(ctx, {
        userId,
        type: "deposit",
        amount: 1000,
        status: "credited",
        relatedId: "deposit-123",
      })
    );

    const rows = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userId,
      type: "deposit",
      amount: 1000,
      status: "credited",
      relatedId: "deposit-123",
    });
    expect(typeof rows[0].createdAt).toBe("number");
  });

  it("allows omitting relatedId", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);

    await t.run((ctx) =>
      writeTransaction(ctx, {
        userId,
        type: "fee",
        amount: -5,
        status: "completed",
      })
    );

    const rows = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(rows[0].relatedId).toBeUndefined();
  });

  it("is queryable via the by_user index for a transaction history view", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);
    const otherUserId = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "other@keystonereits.com",
        passwordHash: "x",
        firstName: "Other",
        lastName: "User",
        emailVerified: true,
        status: "active",
        kycStatus: "approved",
        referralCode: "OTHER001",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) => writeTransaction(ctx, { userId, type: "deposit", amount: 100, status: "credited" }));
    await t.run((ctx) => writeTransaction(ctx, { userId, type: "withdrawal", amount: 50, status: "completed" }));
    await t.run((ctx) =>
      writeTransaction(ctx, { userId: otherUserId, type: "deposit", amount: 999, status: "credited" })
    );

    const mine = await t.run((ctx) =>
      ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    );
    expect(mine).toHaveLength(2);
    expect(mine.every((row) => row.userId === userId)).toBe(true);
  });
});
