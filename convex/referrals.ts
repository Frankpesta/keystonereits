import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const mySummary = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);

    const referredUsers = await ctx.db
      .query("users")
      .withIndex("by_referredBy", (q) => q.eq("referredBy", user._id))
      .take(200);

    const earnings = await ctx.db
      .query("referralEarnings")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .order("desc")
      .take(200);

    return {
      referralCode: user.referralCode,
      referredUsers: referredUsers.map((u) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        createdAt: u.createdAt,
      })),
      earnings,
      totalEarned: earnings.reduce((sum, e) => sum + e.amount, 0),
    };
  },
});
