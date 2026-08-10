import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { hashPassword, verifyPassword } from "./lib/password";
import { issueOtp, verifyAndConsumeOtp } from "./lib/otp";
import { createSession, invalidateAllSessions, deleteSessionByToken } from "./lib/sessions";
import { checkRateLimit } from "./lib/rateLimit";
import { randomReferralCode } from "./lib/crypto";
import {
  signupSchema,
  loginSchema,
  otpVerifySchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../src/lib/validation/auth";

/**
 * Two error-handling conventions live in this file, on purpose:
 *
 * - Most mutations throw `ConvexError("message")` on failure — safe
 *   whenever nothing meaningful was written before the failure point (pure
 *   validation, a read-only lookup).
 * - `login`, `adminLogin`, `verifySignupOtp`, `verifyLoginOtp`,
 *   `adminVerifyLoginOtp`, `resetPassword`, `adminResetPassword` instead
 *   return `{ ok: false, error }`. Each of these can fail *after* a write
 *   that must still survive — a login-attempt or OTP-attempt counter. A
 *   Convex mutation call is one atomic transaction, so a write immediately
 *   followed by a `throw` in the same call is rolled back along with
 *   everything else; returning normally instead of throwing is what lets
 *   the counter commit while still reporting failure to the caller.
 */

const LOGIN_ATTEMPT_MAX = 10;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const RESET_REQUEST_MAX = 5;
const RESET_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const INVALID_OTP_MESSAGE = "Invalid or expired code.";

function firstIssueMessage(error: { issues: { message: string }[] }, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

async function generateUniqueReferralCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomReferralCode();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", code))
      .unique();
    if (!existing) return code;
  }
  throw new ConvexError("Could not generate a referral code. Please try again.");
}

// ============================== USER: SIGNUP ==============================

export const signup = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    country: v.optional(v.string()),
    password: v.string(),
    confirmPassword: v.string(),
    referralCode: v.optional(v.string()),
    termsAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const parsed = signupSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid input."));
    const { email, password, firstName, lastName, phone, country, referralCode } = parsed.data;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existingUser) throw new ConvexError("An account with this email already exists.");

    let referredBy;
    if (referralCode) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
        .unique();
      if (referrer) referredBy = referrer._id;
      // Unknown/typo'd referral codes are silently ignored rather than
      // blocking signup.
    }

    const userId = await ctx.db.insert("users", {
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      phone,
      country,
      emailVerified: false,
      status: "active",
      kycStatus: "not_started",
      referredBy,
      referralCode: await generateUniqueReferralCode(ctx),
      createdAt: Date.now(),
    });

    const code = await issueOtp(ctx, { email, purpose: "signup_verify" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "signup_verify",
      expiresInMinutes: 10,
      userId,
    });

    return { email };
  },
});

export const resendSignupOtp = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user || user.emailVerified) {
      throw new ConvexError("Unable to resend code.");
    }

    const code = await issueOtp(ctx, { email, purpose: "signup_verify" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "signup_verify",
      expiresInMinutes: 10,
      userId: user._id,
    });
    return { email };
  },
});

export const verifySignupOtp = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const parsed = otpVerifySchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid code."));
    const { email, code } = parsed.data;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const otpResult = await verifyAndConsumeOtp(ctx, { email, purpose: "signup_verify", code });
    if (!otpResult.ok) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    await ctx.db.patch(user._id, { emailVerified: true });
    await ctx.db.insert("balances", {
      userId: user._id,
      available: 0,
      invested: 0,
      profit: 0,
      updatedAt: Date.now(),
    });

    const { token, expiresAt } = await createSession(ctx, {
      subjectId: user._id,
      subjectType: "user",
    });

    await ctx.scheduler.runAfter(0, internal.emailActions.sendWelcomeEmail, {
      to: email,
      firstName: user.firstName,
      userId: user._id,
    });

    return { ok: true as const, token, expiresAt };
  },
});

// =============================== USER: LOGIN ===============================

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const parsed = loginSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError("Invalid email or password.");
    const { email, password } = parsed.data;

    await checkRateLimit(ctx, {
      key: `login:${email}`,
      maxAttempts: LOGIN_ATTEMPT_MAX,
      windowMs: LOGIN_ATTEMPT_WINDOW_MS,
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    if (user.status !== "active") {
      return { ok: false as const, error: "This account cannot sign in right now. Please contact support." };
    }

    const code = await issueOtp(ctx, { email, purpose: "login_2fa" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "login_2fa",
      expiresInMinutes: 10,
      userId: user._id,
    });

    return { ok: true as const, email };
  },
});

export const resendLoginOtp = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) throw new ConvexError("Unable to resend code.");

    const code = await issueOtp(ctx, { email, purpose: "login_2fa" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "login_2fa",
      expiresInMinutes: 10,
      userId: user._id,
    });
    return { email };
  },
});

export const verifyLoginOtp = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const parsed = otpVerifySchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid code."));
    const { email, code } = parsed.data;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const otpResult = await verifyAndConsumeOtp(ctx, { email, purpose: "login_2fa", code });
    if (!otpResult.ok) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const { token, expiresAt } = await createSession(ctx, {
      subjectId: user._id,
      subjectType: "user",
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendSecurityAlertEmail, {
      to: email,
      firstName: user.firstName,
      eventType: "new_login",
      when: new Date().toUTCString(),
      userId: user._id,
    });
    return { ok: true as const, token, expiresAt };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await deleteSessionByToken(ctx, args.sessionToken);
    return { ok: true };
  },
});

// ===================== USER: FORGOT / RESET PASSWORD =======================

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const parsed = requestPasswordResetSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError("Invalid email.");
    const { email } = parsed.data;

    await checkRateLimit(ctx, {
      key: `pwreset:${email}`,
      maxAttempts: RESET_REQUEST_MAX,
      windowMs: RESET_REQUEST_WINDOW_MS,
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (user) {
      const code = await issueOtp(ctx, { email, purpose: "password_reset" });
      await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
        to: email,
        code,
        purpose: "password_reset",
        expiresInMinutes: 10,
        userId: user._id,
      });
    }
    // Always report success — don't reveal whether the email is registered.
    return { email };
  },
});

export const resetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = resetPasswordSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid input."));
    const { email, code, newPassword } = parsed.data;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const otpResult = await verifyAndConsumeOtp(ctx, { email, purpose: "password_reset", code });
    if (!otpResult.ok) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    await ctx.db.patch(user._id, { passwordHash: await hashPassword(newPassword) });
    await invalidateAllSessions(ctx, user._id);
    await ctx.scheduler.runAfter(0, internal.emailActions.sendSecurityAlertEmail, {
      to: email,
      firstName: user.firstName,
      eventType: "password_changed",
      when: new Date().toUTCString(),
      userId: user._id,
    });

    return { ok: true as const, email };
  },
});

// ================================= ADMIN ====================================
// Mirrors the user flow above with no signup route, per spec — admins are
// only ever created via Phase 6's authenticated super-admin screen.

export const adminLogin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const parsed = loginSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError("Invalid email or password.");
    const { email, password } = parsed.data;

    await checkRateLimit(ctx, {
      key: `admin-login:${email}`,
      maxAttempts: LOGIN_ATTEMPT_MAX,
      windowMs: LOGIN_ATTEMPT_WINDOW_MS,
    });

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    if (admin.status !== "active") {
      return { ok: false as const, error: "This account cannot sign in right now." };
    }

    const code = await issueOtp(ctx, { email, purpose: "login_2fa" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "login_2fa",
      expiresInMinutes: 10,
    });

    return { ok: true as const, email };
  },
});

export const adminResendLoginOtp = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!admin) throw new ConvexError("Unable to resend code.");

    const code = await issueOtp(ctx, { email, purpose: "login_2fa" });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
      to: email,
      code,
      purpose: "login_2fa",
      expiresInMinutes: 10,
    });
    return { email };
  },
});

export const adminVerifyLoginOtp = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const parsed = otpVerifySchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid code."));
    const { email, code } = parsed.data;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!admin) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const otpResult = await verifyAndConsumeOtp(ctx, { email, purpose: "login_2fa", code });
    if (!otpResult.ok) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const { token, expiresAt } = await createSession(ctx, {
      subjectId: admin._id,
      subjectType: "admin",
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendSecurityAlertEmail, {
      to: email,
      firstName: admin.name,
      eventType: "new_login",
      when: new Date().toUTCString(),
    });
    return { ok: true as const, token, expiresAt };
  },
});

export const adminLogout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await deleteSessionByToken(ctx, args.sessionToken);
    return { ok: true };
  },
});

export const adminRequestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const parsed = requestPasswordResetSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError("Invalid email.");
    const { email } = parsed.data;

    await checkRateLimit(ctx, {
      key: `admin-pwreset:${email}`,
      maxAttempts: RESET_REQUEST_MAX,
      windowMs: RESET_REQUEST_WINDOW_MS,
    });

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (admin) {
      const code = await issueOtp(ctx, { email, purpose: "admin_password_reset" });
      await ctx.scheduler.runAfter(0, internal.emailActions.sendOtpEmail, {
        to: email,
        code,
        purpose: "admin_password_reset",
        expiresInMinutes: 10,
      });
    }
    return { email };
  },
});

export const adminResetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = resetPasswordSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid input."));
    const { email, code, newPassword } = parsed.data;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!admin) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    const otpResult = await verifyAndConsumeOtp(ctx, { email, purpose: "admin_password_reset", code });
    if (!otpResult.ok) return { ok: false as const, error: INVALID_OTP_MESSAGE };

    await ctx.db.patch(admin._id, { passwordHash: await hashPassword(newPassword) });
    await invalidateAllSessions(ctx, admin._id);
    await ctx.scheduler.runAfter(0, internal.emailActions.sendSecurityAlertEmail, {
      to: email,
      firstName: admin.name,
      eventType: "password_changed",
      when: new Date().toUTCString(),
    });

    return { ok: true as const, email };
  },
});
