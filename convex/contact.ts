import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { contactSchema } from "../src/lib/validation/contact";

/**
 * Public — no auth (the visitor doesn't have an account yet). Writes the
 * message and, per Phase 4's spec, is where the Phase-7 Resend notification
 * gets wired in — not built yet, so this only persists the record for now.
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = contactSchema.safeParse(args);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    await ctx.db.insert("contactMessages", {
      ...parsed.data,
      status: "new",
      createdAt: Date.now(),
    });

    // TODO Phase 7: schedule internal.emails.sendContactNotification once the
    // real Resend integration + admin notification templates exist.

    return { ok: true as const };
  },
});
