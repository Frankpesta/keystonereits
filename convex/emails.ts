import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Every real send lives in convex/emailActions.tsx ("use node", so it can't
 * share this file — see that file's docstring) and calls this after
 * attempting a send, success or failure, so `emailLog` is always a complete
 * record regardless of Resend outcome.
 */
export const logEmail = internalMutation({
  args: {
    recipientEmail: v.string(),
    recipientUserId: v.optional(v.id("users")),
    subject: v.string(),
    campaignId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLog", { ...args, createdAt: Date.now() });
  },
});
