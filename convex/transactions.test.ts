// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import type { Id } from "./_generated/dataModel";

async function seedTx(
  t: ReturnType<typeof convexTest>,
  userId: Id<"users">,
  overrides: Partial<{ type: string; status: string; amount: number; createdAt: number }> = {}
) {
  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      userId,
      type: (overrides.type ?? "deposit") as "deposit",
      amount: overrides.amount ?? 100,
      status: overrides.status ?? "pending",
      createdAt: overrides.createdAt ?? Date.now(),
    })
  );
}

describe("transactions.myTransactions", () => {
  it("paginates the user's own ledger, most recent first", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    await seedTx(t, user._id, { amount: 100, createdAt: 1000 });
    await seedTx(t, user._id, { amount: 200, createdAt: 2000 });

    const page = await t.query(api.transactions.myTransactions, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(page.page.map((r) => r.amount)).toEqual([200, 100]);
  });

  it("filters by type", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    await seedTx(t, user._id, { type: "deposit" });
    await seedTx(t, user._id, { type: "withdrawal" });

    const page = await t.query(api.transactions.myTransactions, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
      type: "withdrawal",
    });
    expect(page.page).toHaveLength(1);
    expect(page.page[0].type).toBe("withdrawal");
  });

  it("filters by status", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    await seedTx(t, user._id, { status: "pending" });
    await seedTx(t, user._id, { status: "completed" });

    const page = await t.query(api.transactions.myTransactions, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
      status: "completed",
    });
    expect(page.page).toHaveLength(1);
    expect(page.page[0].status).toBe("completed");
  });

  it("never returns another user's transactions", async () => {
    const t = convexTest(schema, convexTestModules);
    const a = await createVerifiedUser(t);
    const b = await createVerifiedUser(t);
    await seedTx(t, a.user._id);

    const page = await t.query(api.transactions.myTransactions, {
      sessionToken: b.sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(page.page).toEqual([]);
  });
});
