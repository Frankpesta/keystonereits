import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/auth";
import { sha256Hex } from "./lib/crypto";
import { hashPassword, verifyPassword } from "./lib/password";
import { updateProfileSchema, changePasswordSchema } from "../src/lib/validation/profile";

function firstIssueMessage(error: { issues: { message: string }[] }, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

/** Throws if the session is missing/expired/invalid — callers redirect to /login on error. */
export const currentUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      country: user.country,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
    };
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const parsed = updateProfileSchema.safeParse(args);
    if (!parsed.success) throw new ConvexError(firstIssueMessage(parsed.error, "Invalid input."));

    await ctx.db.patch(user._id, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      country: parsed.data.country,
    });
    return { ok: true as const };
  },
});

/**
 * Unlike auth.ts's resetPassword (which invalidates every session because
 * the user just proved control of their email, not an active session), this
 * keeps the caller's own session alive and only invalidates every *other*
 * session — the user is already authenticated here.
 */
export const changePassword = mutation({
  args: {
    sessionToken: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const parsed = changePasswordSchema.safeParse(args);
    if (!parsed.success) return { ok: false as const, error: firstIssueMessage(parsed.error, "Invalid input.") };

    if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
      return { ok: false as const, error: "Current password is incorrect." };
    }

    await ctx.db.patch(user._id, { passwordHash: await hashPassword(parsed.data.newPassword) });

    const currentTokenHash = await sha256Hex(args.sessionToken);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_subject", (q) => q.eq("subjectId", user._id))
      .collect();
    for (const session of sessions) {
      if (session.tokenHash !== currentTokenHash) await ctx.db.delete(session._id);
    }

    await ctx.scheduler.runAfter(0, internal.emailActions.sendSecurityAlertEmail, {
      to: user.email,
      firstName: user.firstName,
      eventType: "password_changed",
      when: new Date().toUTCString(),
      userId: user._id,
    });

    return { ok: true as const };
  },
});
