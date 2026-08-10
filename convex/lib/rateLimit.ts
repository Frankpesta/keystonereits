import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";

/**
 * Generic fixed-window rate limiter backed by the `rateLimits` table.
 * Reused for login attempts, OTP resend, and password-reset requests —
 * every flow the spec calls out as needing rate limiting — rather than
 * bespoke counters per flow.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  args: { key: string; maxAttempts: number; windowMs: number }
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", args.key))
    .unique();

  if (!existing || now - existing.windowStart >= args.windowMs) {
    if (existing) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    } else {
      await ctx.db.insert("rateLimits", { key: args.key, windowStart: now, count: 1 });
    }
    return;
  }

  if (existing.count >= args.maxAttempts) {
    throw new ConvexError("Too many attempts. Please try again later.");
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}
