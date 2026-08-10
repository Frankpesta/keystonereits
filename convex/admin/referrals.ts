import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import type { Doc } from "../_generated/dataModel";

const REFERRAL_ROLES: Doc<"admins">["role"][] = ["super", "marketing", "finance"];

export const overview = query({
  args: { sessionToken: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REFERRAL_ROLES);

    const earnings = await ctx.db.query("referralEarnings").order("desc").take(300);
    const withNames = await Promise.all(
      earnings.map(async (e) => {
        const [referrer, referred] = await Promise.all([ctx.db.get(e.referrerId), ctx.db.get(e.referredUserId)]);
        return {
          ...e,
          referrerName: referrer ? `${referrer.firstName} ${referrer.lastName}` : "Unknown user",
          referrerEmail: referrer?.email,
          referredName: referred ? `${referred.firstName} ${referred.lastName}` : "Unknown user",
        };
      })
    );

    const term = args.search?.trim().toLowerCase();
    const filtered = term
      ? withNames.filter(
          (e) => e.referrerName.toLowerCase().includes(term) || e.referrerEmail?.toLowerCase().includes(term)
        )
      : withNames;

    return {
      totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
      totalCount: earnings.length,
      earnings: filtered,
    };
  },
});
