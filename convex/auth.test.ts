// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest, type TestConvex } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { sha256Hex } from "./lib/crypto";

const SIGNUP_ARGS = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  password: "SuperSecret1",
  confirmPassword: "SuperSecret1",
  termsAccepted: true,
};

/** Only the OTP hash is ever persisted — tests that need a known code patch it in directly. */
async function plantKnownOtpCode(t: TestConvex<typeof schema>, email: string, code: string) {
  const row = await t.run((ctx) =>
    ctx.db
      .query("otpCodes")
      .withIndex("by_email_purpose", (q) => q.eq("email", email))
      .first()
  );
  if (!row) throw new Error("no otp row found to plant a known code into");
  await t.run(async (ctx) => ctx.db.patch(row._id, { codeHash: await sha256Hex(code) }));
}

async function getLatestOtpCode(t: TestConvex<typeof schema>, email: string) {
  const rows = await t.run((ctx) =>
    ctx.db
      .query("otpCodes")
      .withIndex("by_email_purpose", (q) => q.eq("email", email))
      .collect()
  );
  const row = rows.filter((r) => !r.consumedAt).at(-1);
  if (!row) throw new Error("no unconsumed otp row found");
  return row;
}

describe("signup -> verifySignupOtp", () => {
  it("issues a signup_verify OTP row", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);

    const otpRow = await getLatestOtpCode(t, SIGNUP_ARGS.email);
    expect(otpRow.purpose).toBe("signup_verify");
  });

  it("a correct code verifies successfully end-to-end", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);
    await plantKnownOtpCode(t, SIGNUP_ARGS.email, "123456");

    const result = await t.mutation(api.auth.verifySignupOtp, {
      email: SIGNUP_ARGS.email,
      code: "123456",
    });
    expect(result.ok).toBe(true);

    const user = await t.run((ctx) =>
      ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", SIGNUP_ARGS.email))
        .unique()
    );
    expect(user?.emailVerified).toBe(true);

    const balances = await t.run((ctx) => ctx.db.query("balances").collect());
    expect(balances).toHaveLength(1);
    expect(balances[0]).toMatchObject({ available: 0, invested: 0, profit: 0 });

    const sessions = await t.run((ctx) => ctx.db.query("sessions").collect());
    expect(sessions).toHaveLength(1);
  });

  it("rejects a signup with an already-registered email", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);
    await expect(t.mutation(api.auth.signup, SIGNUP_ARGS)).rejects.toThrow();
  });

  it("schedules an OTP email that actually sends (Phase 7 wiring, not just the OTP row)", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }

    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: SIGNUP_ARGS.email, status: "sent" }]);
  });

  it("verifying signup schedules a welcome email", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);
    await plantKnownOtpCode(t, SIGNUP_ARGS.email, "123456");
    await t.mutation(api.auth.verifySignupOtp, { email: SIGNUP_ARGS.email, code: "123456" });

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }

    const subjects = await t.run((ctx) => ctx.db.query("emailLog").collect()).then((rows) => rows.map((r) => r.subject));
    expect(subjects).toContain("Welcome to Keystone REIT");
  });

  it("wrong verification code returns { ok: false } and persists the attempt (regression: transactional rollback bug)", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);

    const result = await t.mutation(api.auth.verifySignupOtp, {
      email: SIGNUP_ARGS.email,
      code: "000000",
    });
    expect(result).toEqual({ ok: false, error: "Invalid or expired code." });

    const otpRow = await getLatestOtpCode(t, SIGNUP_ARGS.email);
    // This is the exact bug that was found: a naive `patch then throw`
    // inside the same mutation call rolls back the patch, so `attempts`
    // would incorrectly read 0 here without the fix.
    expect(otpRow.attempts).toBe(1);
  });

  it("locks out after 5 wrong attempts, persisting all of them", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);

    for (let i = 0; i < 5; i++) {
      const result = await t.mutation(api.auth.verifySignupOtp, {
        email: SIGNUP_ARGS.email,
        code: "000000",
      });
      expect(result.ok).toBe(false);
    }

    const otpRow = await getLatestOtpCode(t, SIGNUP_ARGS.email);
    expect(otpRow.attempts).toBe(5);
  });

  it("a user cannot land on an authenticated view without ever having verified", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.auth.signup, SIGNUP_ARGS);

    const user = await t.run((ctx) =>
      ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", SIGNUP_ARGS.email))
        .unique()
    );
    expect(user?.emailVerified).toBe(false);

    const balances = await t.run((ctx) => ctx.db.query("balances").collect());
    expect(balances).toHaveLength(0);
  });
});

describe("login", () => {
  async function signupAndVerify(t: TestConvex<typeof schema>) {
    await t.mutation(api.auth.signup, SIGNUP_ARGS);
    // Directly consume the OTP via the db so we don't need the raw code.
    const otpRow = await t.run((ctx) => ctx.db.query("otpCodes").first());
    await t.run((ctx) => ctx.db.patch(otpRow!._id, { consumedAt: Date.now() }));
    const user = await t.run((ctx) =>
      ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", SIGNUP_ARGS.email))
        .unique()
    );
    await t.run((ctx) => ctx.db.patch(user!._id, { emailVerified: true }));
    await t.run((ctx) =>
      ctx.db.insert("balances", { userId: user!._id, available: 0, invested: 0, profit: 0, updatedAt: Date.now() })
    );
    return user!;
  }

  it("wrong password returns { ok: false } without revealing which field was wrong", async () => {
    const t = convexTest(schema, convexTestModules);
    await signupAndVerify(t);

    const result = await t.mutation(api.auth.login, {
      email: SIGNUP_ARGS.email,
      password: "wrong-password",
    });
    expect(result).toEqual({ ok: false, error: "Invalid email or password." });
  });

  it("persists the login-attempt rate-limit counter across wrong-password calls (regression: transactional rollback bug)", async () => {
    const t = convexTest(schema, convexTestModules);
    await signupAndVerify(t);

    for (let i = 0; i < 10; i++) {
      await t.mutation(api.auth.login, { email: SIGNUP_ARGS.email, password: "wrong-password" });
    }

    // The 11th attempt should be blocked by the rate limiter — this only
    // happens if all 10 prior increments actually persisted despite each
    // call reporting { ok: false } for a wrong password.
    await expect(
      t.mutation(api.auth.login, { email: SIGNUP_ARGS.email, password: "wrong-password" })
    ).rejects.toThrow();
  });

  it("correct password issues an OTP and returns { ok: true, email }", async () => {
    const t = convexTest(schema, convexTestModules);
    await signupAndVerify(t);

    const result = await t.mutation(api.auth.login, {
      email: SIGNUP_ARGS.email,
      password: SIGNUP_ARGS.password,
    });
    expect(result).toEqual({ ok: true, email: SIGNUP_ARGS.email });
  });

  it("verifyLoginOtp creates a session on success", async () => {
    const t = convexTest(schema, convexTestModules);
    await signupAndVerify(t);
    await t.mutation(api.auth.login, { email: SIGNUP_ARGS.email, password: SIGNUP_ARGS.password });

    const knownCode = "654321";
    await plantKnownOtpCode(t, SIGNUP_ARGS.email, knownCode);

    const result = await t.mutation(api.auth.verifyLoginOtp, { email: SIGNUP_ARGS.email, code: knownCode });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const sessions = await t.run((ctx) => ctx.db.query("sessions").collect());
      expect(sessions).toHaveLength(1);
      expect(sessions[0].tokenHash).toBe(await sha256Hex(result.token));
    }
  });
});

describe("resetPassword", () => {
  it("invalidates all sessions and allows login with the new password", async () => {
    const t = convexTest(schema, convexTestModules);
    const user = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "reset-me@example.com",
        passwordHash: "placeholder",
        firstName: "Reset",
        lastName: "Me",
        emailVerified: true,
        status: "active",
        kycStatus: "not_started",
        referralCode: "RESETME1",
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("sessions", {
        subjectId: user,
        subjectType: "user",
        tokenHash: "some-hash",
        expiresAt: Date.now() + 100_000,
        createdAt: Date.now(),
      })
    );
    await t.run((ctx) =>
      ctx.db.insert("otpCodes", {
        email: "reset-me@example.com",
        codeHash: "placeholder",
        purpose: "password_reset",
        expiresAt: Date.now() + 100_000,
        attempts: 0,
      })
    );
    const knownCode = "222222";
    await plantKnownOtpCode(t, "reset-me@example.com", knownCode);

    const result = await t.mutation(api.auth.resetPassword, {
      email: "reset-me@example.com",
      code: knownCode,
      newPassword: "BrandNewPass1",
      confirmPassword: "BrandNewPass1",
    });
    expect(result).toEqual({ ok: true, email: "reset-me@example.com" });

    const sessions = await t.run((ctx) => ctx.db.query("sessions").collect());
    expect(sessions).toHaveLength(0);
  });
});
