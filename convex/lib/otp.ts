import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { randomDigits, sha256Hex } from "./crypto";
import { checkRateLimit } from "./rateLimit";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_MAX_PER_WINDOW = 5;
const OTP_RESEND_WINDOW_MS = 15 * 60 * 1000;

type OtpPurpose = Doc<"otpCodes">["purpose"];

/**
 * Rate-limits, replaces any existing unconsumed code for this email+purpose
 * (schema requires exactly one active code at a time), and stores only the
 * hash. Returns the raw 6-digit code so the caller can schedule the email
 * action — never persisted or logged anywhere except that stub email action.
 */
export async function issueOtp(
  ctx: MutationCtx,
  args: { email: string; purpose: OtpPurpose }
): Promise<string> {
  await checkRateLimit(ctx, {
    key: `otp:${args.purpose}:${args.email}`,
    maxAttempts: OTP_RESEND_MAX_PER_WINDOW,
    windowMs: OTP_RESEND_WINDOW_MS,
  });

  const existing = await ctx.db
    .query("otpCodes")
    .withIndex("by_email_purpose", (q) => q.eq("email", args.email).eq("purpose", args.purpose))
    .collect();
  for (const row of existing) {
    if (!row.consumedAt) await ctx.db.delete(row._id);
  }

  const code = randomDigits(6);
  await ctx.db.insert("otpCodes", {
    email: args.email,
    codeHash: await sha256Hex(code),
    purpose: args.purpose,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });

  return code;
}

/**
 * Returns `{ ok: false }` rather than throwing on failure — a Convex
 * mutation call is one atomic transaction, so a write immediately followed
 * by a `throw` in the *same* call gets rolled back along with everything
 * else. The attempts-increment on a wrong code needs to survive even though
 * the overall operation is reporting failure, so failure here is a normal
 * return value; the calling mutation must also avoid throwing afterward
 * (see convex/auth.ts's verify*Otp / resetPassword mutations, which return
 * `{ ok: false, error }` instead of throwing for exactly this reason).
 */
export async function verifyAndConsumeOtp(
  ctx: MutationCtx,
  args: { email: string; purpose: OtpPurpose; code: string }
): Promise<{ ok: true } | { ok: false }> {
  const candidates = await ctx.db
    .query("otpCodes")
    .withIndex("by_email_purpose", (q) => q.eq("email", args.email).eq("purpose", args.purpose))
    .collect();
  const row = candidates.find((r) => !r.consumedAt);

  if (!row || row.expiresAt < Date.now()) {
    return { ok: false };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false };
  }

  const candidateHash = await sha256Hex(args.code);
  if (candidateHash !== row.codeHash) {
    await ctx.db.patch(row._id, { attempts: row.attempts + 1 });
    return { ok: false };
  }

  await ctx.db.patch(row._id, { consumedAt: Date.now() });
  return { ok: true };
}
