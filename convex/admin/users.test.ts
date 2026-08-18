// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest, type TestConvex } from "convex-test";
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

describe("admin/users.impersonate", () => {
  it("mints a working session for the user and writes an audit log entry", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await createVerifiedUser(t);

    const result = await t.mutation(api.admin.users.impersonate, { sessionToken, userId: user._id });
    expect(result.token).toBeTruthy();

    const impersonated = await t.query(api.users.currentUser, { sessionToken: result.token });
    expect(impersonated._id).toBe(user._id);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "user_impersonated", targetType: "user" }]);
  });

  it("does not notify the user or send any email", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await createVerifiedUser(t);

    await t.mutation(api.admin.users.impersonate, { sessionToken, userId: user._id });

    const notifications = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", user._id)).collect()
    );
    expect(notifications).toHaveLength(0);

    const scheduled = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled).toHaveLength(0);
  });

  it("rejects a non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.impersonate, { sessionToken, userId: user._id })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/users.deleteUser", () => {
  async function seedFullAccount(t: TestConvex<typeof schema>) {
    const { user } = await createVerifiedUser(t, { available: 100 });

    const documentFileId = await t.run((ctx) => ctx.storage.store(new Blob(["doc"], { type: "application/pdf" })));
    await t.run((ctx) =>
      ctx.db.insert("kycApplications", {
        userId: user._id,
        status: "approved",
        fullName: "Jane Doe",
        dateOfBirth: "1990-01-01",
        address: "1 Main St",
        documentType: "passport",
        documentFileId,
        submittedAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("deposits", { userId: user._id, method: "crypto", amountUsd: 500, status: "credited", createdAt: Date.now() })
    );
    await t.run((ctx) =>
      ctx.db.insert("withdrawals", {
        userId: user._id,
        balanceSource: "available",
        amountUsd: 50,
        walletAddress: "0xabc",
        network: "TRC20",
        status: "completed",
        createdAt: Date.now(),
      })
    );
    const { admin: planCreator } = await createAdmin(t);
    const planId = await t.run((ctx) =>
      ctx.db.insert("investmentPlans", {
        name: "Growth",
        description: "desc",
        minAmount: 100,
        maxAmount: 10000,
        durationDays: 90,
        weeklyReturnPercent: 2,
        accrualFrequency: "weekly",
        status: "active",
        createdBy: planCreator._id,
        createdAt: Date.now(),
      })
    );
    const investmentId = await t.run((ctx) =>
      ctx.db.insert("investments", {
        userId: user._id,
        planId,
        amount: 500,
        startDate: Date.now(),
        maturityDate: Date.now() + 1000,
        accruedProfit: 10,
        status: "active",
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("profitAccruals", {
        userId: user._id,
        investmentId,
        planId,
        amount: 10,
        accrualDate: "2026-01-01",
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("transactions", { userId: user._id, type: "deposit", amount: 500, status: "credited", createdAt: Date.now() })
    );
    const ticketId = await t.run((ctx) =>
      ctx.db.insert("supportTickets", {
        userId: user._id,
        subject: "Help",
        category: "general",
        status: "open",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("supportMessages", { ticketId, authorType: "user", authorId: user._id, body: "hi", createdAt: Date.now() })
    );
    await t.run((ctx) =>
      ctx.db.insert("notifications", { userId: user._id, type: "info", title: "t", body: "b", read: false, createdAt: Date.now() })
    );

    return { user, documentFileId };
  }

  it("requires the confirmation email to match", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.deleteUser, {
        sessionToken,
        userId: user._id,
        confirmEmail: "wrong@example.com",
        reason: "test",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.admin.users.deleteUser, {
        sessionToken,
        userId: user._id,
        confirmEmail: user.email,
        reason: "test",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("permanently erases the user and every record that belongs to them", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });
    const { user } = await seedFullAccount(t);

    const result = await t.mutation(api.admin.users.deleteUser, {
      sessionToken,
      userId: user._id,
      confirmEmail: user.email,
      reason: "GDPR erasure request",
    });
    expect(result).toEqual({ ok: true });

    expect(await t.run((ctx) => ctx.db.get(user._id))).toBeNull();

    const byUserId = <T extends { userId?: unknown }>(rows: T[]) => rows.filter((r) => r.userId === user._id);
    const [balances, kyc, deposits, withdrawals, investments, accruals, transactions, tickets, messages, notifications, sessions] =
      await t.run(async (ctx) => [
        await ctx.db.query("balances").collect(),
        await ctx.db.query("kycApplications").collect(),
        await ctx.db.query("deposits").collect(),
        await ctx.db.query("withdrawals").collect(),
        await ctx.db.query("investments").collect(),
        await ctx.db.query("profitAccruals").collect(),
        await ctx.db.query("transactions").collect(),
        await ctx.db.query("supportTickets").collect(),
        await ctx.db.query("supportMessages").collect(),
        await ctx.db.query("notifications").collect(),
        await ctx.db.query("sessions").withIndex("by_subject", (q) => q.eq("subjectId", user._id)).collect(),
      ]);

    expect(byUserId(balances)).toHaveLength(0);
    expect(byUserId(kyc)).toHaveLength(0);
    expect(byUserId(deposits)).toHaveLength(0);
    expect(byUserId(withdrawals)).toHaveLength(0);
    expect(byUserId(investments)).toHaveLength(0);
    expect(byUserId(accruals)).toHaveLength(0);
    expect(byUserId(transactions)).toHaveLength(0);
    expect(tickets).toHaveLength(0);
    expect(messages).toHaveLength(0);
    expect(notifications).toHaveLength(0);
    expect(sessions).toHaveLength(0);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "user_deleted", targetType: "user" }]);
  });

  it("clears the referredBy pointer on users this account referred, without touching their own data", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user: referrer } = await createVerifiedUser(t);
    const { user: referredUser } = await createVerifiedUser(t);
    await t.run((ctx) => ctx.db.patch(referredUser._id, { referredBy: referrer._id }));

    await t.mutation(api.admin.users.deleteUser, {
      sessionToken,
      userId: referrer._id,
      confirmEmail: referrer.email,
      reason: "test",
    });

    const updated = await t.run((ctx) => ctx.db.get(referredUser._id));
    expect(updated).not.toBeNull();
    expect(updated?.referredBy).toBeUndefined();
  });

  it("leaves a referral earning intact when this user is only the referred party", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { user: referrer } = await createVerifiedUser(t);
    const { user: referredUser } = await createVerifiedUser(t);
    const earningId = await t.run((ctx) =>
      ctx.db.insert("referralEarnings", { referrerId: referrer._id, referredUserId: referredUser._id, amount: 25, createdAt: Date.now() })
    );

    await t.mutation(api.admin.users.deleteUser, {
      sessionToken,
      userId: referredUser._id,
      confirmEmail: referredUser.email,
      reason: "test",
    });

    const earning = await t.run((ctx) => ctx.db.get(earningId));
    expect(earning).not.toBeNull();
    expect(earning?.amount).toBe(25);
  });
});
