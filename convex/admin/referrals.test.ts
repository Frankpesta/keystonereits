// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";

describe("admin/referrals.overview", () => {
  it("aggregates totals and joins referrer/referred names", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    const referrer = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    const referred = await createVerifiedUser(t, { firstName: "Grace", lastName: "Hopper" });

    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", { referrerId: referrer.user._id, referredUserId: referred.user._id, amount: 30, createdAt: Date.now() })
    );
    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", { referrerId: referrer.user._id, referredUserId: referred.user._id, amount: 10, createdAt: Date.now() })
    );

    const overview = await t.query(api.admin.referrals.overview, { sessionToken });
    expect(overview.totalEarnings).toBe(40);
    expect(overview.totalCount).toBe(2);
    expect(overview.earnings[0].referrerName).toBe("Ada Lovelace");
    expect(overview.earnings[0].referredName).toBe("Grace Hopper");
  });

  it("filters by referrer search term", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    const ada = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    const grace = await createVerifiedUser(t, { firstName: "Grace", lastName: "Hopper" });
    const referred = await createVerifiedUser(t);

    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", { referrerId: ada.user._id, referredUserId: referred.user._id, amount: 5, createdAt: Date.now() })
    );
    await t.run((ctx) =>
      ctx.db.insert("referralEarnings", { referrerId: grace.user._id, referredUserId: referred.user._id, amount: 5, createdAt: Date.now() })
    );

    const overview = await t.query(api.admin.referrals.overview, { sessionToken, search: "grace" });
    expect(overview.earnings).toHaveLength(1);
    expect(overview.earnings[0].referrerName).toBe("Grace Hopper");
  });

  it("rejects a role without referral access", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "kyc" });
    await expect(t.query(api.admin.referrals.overview, { sessionToken })).rejects.toThrow(ConvexError);
  });
});
