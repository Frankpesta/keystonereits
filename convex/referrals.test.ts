// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";

describe("referrals.mySummary", () => {
  it("lists referred users and sums earnings", async () => {
    const t = convexTest(schema, convexTestModules);
    const referrer = await createVerifiedUser(t);

    const referredId = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "referred@example.com",
        passwordHash: "x",
        firstName: "Sam",
        lastName: "Referred",
        emailVerified: true,
        status: "active",
        kycStatus: "not_started",
        referredBy: referrer.user._id,
        referralCode: "SAMREF01",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", {
        referrerId: referrer.user._id,
        referredUserId: referredId,
        amount: 25,
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", {
        referrerId: referrer.user._id,
        referredUserId: referredId,
        amount: 10,
        createdAt: Date.now(),
      })
    );

    const summary = await t.query(api.referrals.mySummary, { sessionToken: referrer.sessionToken });
    expect(summary.referralCode).toBe(referrer.user.referralCode);
    expect(summary.referredUsers).toHaveLength(1);
    expect(summary.referredUsers[0].firstName).toBe("Sam");
    expect(summary.totalEarned).toBe(35);
  });

  it("returns empty lists for a user with no referrals", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    const summary = await t.query(api.referrals.mySummary, { sessionToken });
    expect(summary.referredUsers).toEqual([]);
    expect(summary.earnings).toEqual([]);
    expect(summary.totalEarned).toBe(0);
  });
});
