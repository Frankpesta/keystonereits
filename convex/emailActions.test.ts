// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";

/**
 * RESEND_API_KEY is intentionally never set in tests — every action below
 * must take the dev-stub fallback path (console.log + a "sent" emailLog
 * row) rather than attempting a real network call. Each test exercises the
 * action directly (t.action, not scheduled) to isolate template-rendering
 * correctness from the mutation-side wiring, which is covered separately in
 * each domain's own test file.
 */

describe("emailActions dev-stub fallback", () => {
  it("prints the OTP code in plain text to the console (regression: QA relies on `npx convex logs`)", async () => {
    const t = convexTest(schema, convexTestModules);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await t.action(internal.emailActions.sendOtpEmail, {
        to: "user@example.com",
        code: "482913",
        purpose: "login_2fa",
        expiresInMinutes: 10,
      });
      const loggedLines = logSpy.mock.calls.map((call) => String(call[0]));
      expect(loggedLines.some((line) => line.includes("482913"))).toBe(true);
    } finally {
      logSpy.mockRestore();
    }
  });

  it("sendOtpEmail renders and logs for every purpose", async () => {
    const t = convexTest(schema, convexTestModules);
    for (const purpose of ["signup_verify", "login_2fa", "password_reset", "admin_password_reset"] as const) {
      await t.action(internal.emailActions.sendOtpEmail, {
        to: "user@example.com",
        code: "123456",
        purpose,
        expiresInMinutes: 10,
      });
    }
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(4);
    expect(log.every((l) => l.status === "sent")).toBe(true);
  });

  it("sendWelcomeEmail logs against the recipient user", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "welcome@example.com",
        passwordHash: "x",
        firstName: "Jane",
        lastName: "Doe",
        emailVerified: true,
        status: "active",
        kycStatus: "not_started",
        referralCode: "ABC12345",
        createdAt: Date.now(),
      })
    );
    await t.action(internal.emailActions.sendWelcomeEmail, { to: "welcome@example.com", firstName: "Jane", userId });

    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toMatchObject([{ recipientEmail: "welcome@example.com", recipientUserId: userId, status: "sent" }]);
  });

  it("sendKycStatusEmail handles all three statuses without throwing", async () => {
    const t = convexTest(schema, convexTestModules);
    for (const status of ["approved", "rejected", "info_required"] as const) {
      await t.action(internal.emailActions.sendKycStatusEmail, {
        to: "user@example.com",
        firstName: "Jane",
        status,
        note: status === "approved" ? undefined : "Please resubmit.",
      });
    }
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(3);
  });

  it("sendDepositReceivedEmail and sendDepositCreditedEmail both log", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.action(internal.emailActions.sendDepositReceivedEmail, {
      to: "user@example.com",
      firstName: "Jane",
      amountUsd: 500,
      method: "crypto",
    });
    await t.action(internal.emailActions.sendDepositCreditedEmail, {
      to: "user@example.com",
      firstName: "Jane",
      amountUsd: 500,
    });
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(2);
  });

  it("sendInvestmentCreatedEmail and sendInvestmentCompletedEmail both log", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.action(internal.emailActions.sendInvestmentCreatedEmail, {
      to: "user@example.com",
      firstName: "Jane",
      planName: "Growth",
      amountUsd: 10_000,
      maturityDate: "Jan 1, 2027",
    });
    await t.action(internal.emailActions.sendInvestmentCompletedEmail, {
      to: "user@example.com",
      firstName: "Jane",
      planName: "Growth",
      amountUsd: 10_000,
      accruedProfit: 1_500,
    });
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(2);
  });

  it("sendWithdrawalStatusEmail handles every status", async () => {
    const t = convexTest(schema, convexTestModules);
    for (const status of ["pending", "approved", "processing", "completed", "rejected", "failed"] as const) {
      await t.action(internal.emailActions.sendWithdrawalStatusEmail, {
        to: "user@example.com",
        firstName: "Jane",
        amountUsd: 300,
        status,
        reason: status === "rejected" || status === "failed" ? "Wallet address invalid." : undefined,
      });
    }
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(6);
  });

  it("sendSupportTicketReplyEmail logs for both user and admin recipients", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.action(internal.emailActions.sendSupportTicketReplyEmail, {
      to: "user@example.com",
      recipientName: "Jane",
      ticketSubject: "Help",
      messageBody: "We're on it.",
      ticketId: "abc123",
      isAdminRecipient: false,
    });
    await t.action(internal.emailActions.sendSupportTicketReplyEmail, {
      to: "admin@example.com",
      recipientName: "Support",
      ticketSubject: "Help",
      messageBody: "Following up.",
      ticketId: "abc123",
      isAdminRecipient: true,
    });
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(2);
  });

  it("sendAdminBroadcastEmail carries the campaignId through to the log row", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.action(internal.emailActions.sendAdminBroadcastEmail, {
      to: "user@example.com",
      subject: "Update",
      body: "Hello!",
      campaignId: "all-12345",
    });
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toMatchObject([{ campaignId: "all-12345", status: "sent" }]);
  });

  it("sendSecurityAlertEmail handles both event types", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.action(internal.emailActions.sendSecurityAlertEmail, {
      to: "user@example.com",
      firstName: "Jane",
      eventType: "new_login",
      when: "Jan 1, 2027",
    });
    await t.action(internal.emailActions.sendSecurityAlertEmail, {
      to: "user@example.com",
      firstName: "Jane",
      eventType: "password_changed",
      when: "Jan 1, 2027",
    });
    const log = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(log).toHaveLength(2);
  });
});
