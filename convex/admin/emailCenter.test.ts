// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";

describe("admin/emailCenter.segmentCounts", () => {
  it("computes real segment membership from the data, not a hardcoded list", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    await createVerifiedUser(t, { kycStatus: "approved" });
    await createVerifiedUser(t, { kycStatus: "pending" });
    await createVerifiedUser(t, { kycStatus: "not_started" });

    const counts = await t.query(api.admin.emailCenter.segmentCounts, { sessionToken });
    const byKey = Object.fromEntries(counts.map((c) => [c.segment, c.count]));
    expect(byKey.all).toBe(3);
    expect(byKey.kyc_approved).toBe(1);
    expect(byKey.kyc_pending).toBe(1);
  });

  it("has_deposited only counts users with a credited deposit", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    const funded = await createVerifiedUser(t);
    await createVerifiedUser(t);

    await t.run((ctx) =>
      ctx.db.insert("deposits", { userId: funded.user._id, method: "crypto", amountUsd: 100, status: "credited", createdAt: Date.now() })
    );

    const counts = await t.query(api.admin.emailCenter.segmentCounts, { sessionToken });
    expect(Object.fromEntries(counts.map((c) => [c.segment, c.count])).has_deposited).toBe(1);
  });
});

describe("admin/emailCenter.send", () => {
  it("schedules a send to an individual user and logs the action", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "marketing" });
    const { user } = await createVerifiedUser(t);

    const result = await t.mutation(api.admin.emailCenter.send, {
      sessionToken,
      subject: "Welcome",
      body: "Thanks for joining.",
      target: { mode: "individual", userId: user._id },
    });
    expect(result).toEqual({ ok: true, recipientCount: 1 });

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, subject: "Welcome", status: "sent" }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "email_send", amount: 1 }]);
  });

  it("segment send tags every log row with the same campaignId", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    await createVerifiedUser(t, { kycStatus: "approved" });
    await createVerifiedUser(t, { kycStatus: "approved" });
    await createVerifiedUser(t, { kycStatus: "not_started" });

    const result = await t.mutation(api.admin.emailCenter.send, {
      sessionToken,
      subject: "KYC reminder",
      body: "You're verified!",
      target: { mode: "segment", segment: "kyc_approved" },
    });
    expect(result.recipientCount).toBe(2);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toHaveLength(2);
    expect(emailLog[0].campaignId).toBe(emailLog[1].campaignId);
    expect(emailLog[0].campaignId).toContain("kyc_approved");
  });

  it("rejects an empty segment", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });

    await expect(
      t.mutation(api.admin.emailCenter.send, {
        sessionToken,
        subject: "Hi",
        body: "Hi",
        target: { mode: "segment", segment: "has_deposited" },
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-marketing, non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.emailCenter.send, {
        sessionToken,
        subject: "Hi",
        body: "Hi",
        target: { mode: "individual", userId: user._id },
      })
    ).rejects.toThrow(ConvexError);
  });
});
