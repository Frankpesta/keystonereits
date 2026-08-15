// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import { verifyPassword } from "../lib/password";

describe("admin/users.list", () => {
  it("filters by search term across name and email", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
    await createVerifiedUser(t, { firstName: "Grace", lastName: "Hopper", email: "grace@example.com" });

    const results = await t.query(api.admin.users.list, { sessionToken, search: "ada" });
    expect(results).toHaveLength(1);
    expect(results[0].firstName).toBe("Ada");
  });

  it("filters by status", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const suspended = await createVerifiedUser(t);
    await t.run((ctx) => ctx.db.patch(suspended.user._id, { status: "suspended" }));
    await createVerifiedUser(t);

    const results = await t.query(api.admin.users.list, { sessionToken, status: "suspended" });
    expect(results).toHaveLength(1);
    expect(results[0]._id).toBe(suspended.user._id);
  });
});

describe("admin/users.detail", () => {
  it("aggregates the user's full financial picture", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t, { available: 1000 });

    await t.run((ctx) =>
      ctx.db.insert("deposits", { userId: user._id, method: "crypto", amountUsd: 500, status: "credited", createdAt: Date.now() })
    );

    const detail = await t.query(api.admin.users.detail, { sessionToken, userId: user._id });
    expect(detail.user._id).toBe(user._id);
    expect(detail.balance?.available).toBe(1000);
    expect(detail.deposits).toHaveLength(1);
  });

  it("never returns the user's passwordHash", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t);

    const detail = await t.query(api.admin.users.detail, { sessionToken, userId: user._id });
    expect(detail.user).not.toHaveProperty("passwordHash");
  });

  it("resolves the referring user and enriches the KYC application", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user: referrer } = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    const { user } = await createVerifiedUser(t);
    await t.run((ctx) => ctx.db.patch(user._id, { referredBy: referrer._id }));

    const documentFileId = await t.run((ctx) => ctx.storage.store(new Blob(["fake document"], { type: "application/pdf" })));
    await t.run((ctx) =>
      ctx.db.insert("kycApplications", {
        userId: user._id,
        status: "pending",
        fullName: "Jane Doe",
        dateOfBirth: "1990-01-01",
        address: "1 Main St",
        documentType: "passport",
        documentFileId,
        submittedAt: Date.now(),
      })
    );

    const detail = await t.query(api.admin.users.detail, { sessionToken, userId: user._id });
    expect(detail.referredByUser).toMatchObject({ firstName: "Ada", lastName: "Lovelace" });
    expect(detail.kycApplication).toMatchObject({ fullName: "Jane Doe" });
    expect(detail.kycApplication?.documentUrl).toBeTruthy();
  });
});

describe("admin/users.updateStatus", () => {
  it("suspends a user and writes an audit log entry", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t);

    const result = await t.mutation(api.admin.users.updateStatus, {
      sessionToken,
      userId: user._id,
      status: "suspended",
      reason: "Suspicious activity reported.",
    });
    expect(result).toEqual({ ok: true });

    const updated = await t.run((ctx) => ctx.db.get(user._id));
    expect(updated?.status).toBe("suspended");

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ adminId: admin._id, action: "user_status_update", targetType: "user" });
  });

  it("requires a reason", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t);
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.updateStatus, { sessionToken, userId: user._id, status: "suspended", reason: "  " })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.updateStatus, {
        sessionToken,
        userId: user._id,
        status: "suspended",
        reason: "test",
      })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/users.adjustBalance", () => {
  it("credits a balance and records adjustment + transaction + audit log", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 500 });

    const result = await t.mutation(api.admin.users.adjustBalance, {
      sessionToken,
      userId: user._id,
      balanceType: "available",
      direction: "credit",
      amount: 200,
      reason: "Manual bonus credit.",
    });
    expect(result).toEqual({ ok: true });

    const balance = await t.run((ctx) =>
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", user._id)).unique()
    );
    expect(balance?.available).toBe(700);

    const adjustments = await t.run((ctx) => ctx.db.query("balanceAdjustments").collect());
    expect(adjustments).toMatchObject([{ direction: "credit", amount: 200, performedBy: admin._id }]);

    const transactions = await t.run((ctx) => ctx.db.query("transactions").collect());
    expect(transactions).toMatchObject([{ type: "admin_adjustment", amount: 200 }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ action: "balance_adjustment" }]);
  });

  it("rejects a debit that would take the balance negative", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t, { available: 100 });

    await expect(
      t.mutation(api.admin.users.adjustBalance, {
        sessionToken,
        userId: user._id,
        balanceType: "available",
        direction: "debit",
        amount: 500,
        reason: "test",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-finance, non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t, { available: 500 });

    await expect(
      t.mutation(api.admin.users.adjustBalance, {
        sessionToken,
        userId: user._id,
        balanceType: "available",
        direction: "credit",
        amount: 50,
        reason: "test",
      })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/users.resetPassword", () => {
  it("sets a new password, signs the user out everywhere, and writes an audit log entry", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });
    const { user, sessionToken: userSessionToken } = await createVerifiedUser(t);

    const result = await t.mutation(api.admin.users.resetPassword, {
      sessionToken,
      userId: user._id,
      newPassword: "BrandNewPassword1",
    });
    expect(result).toEqual({ ok: true });

    const updated = await t.run((ctx) => ctx.db.get(user._id));
    expect(await verifyPassword("BrandNewPassword1", updated!.passwordHash)).toBe(true);

    await expect(t.query(api.users.currentUser, { sessionToken: userSessionToken })).rejects.toThrow(ConvexError);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "user_password_reset", targetType: "user" }]);
  });

  it("does not notify the user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await createVerifiedUser(t);

    await t.mutation(api.admin.users.resetPassword, {
      sessionToken,
      userId: user._id,
      newPassword: "BrandNewPassword1",
    });

    const notifications = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
    );
    expect(notifications).toHaveLength(0);

    const scheduled = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled).toHaveLength(0);
  });

  it("rejects a password that fails the strength requirement", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.resetPassword, { sessionToken, userId: user._id, newPassword: "short" })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a support-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.resetPassword, { sessionToken, userId: user._id, newPassword: "BrandNewPassword1" })
    ).rejects.toThrow(ConvexError);
  });
});
