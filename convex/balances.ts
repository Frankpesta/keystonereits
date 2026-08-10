import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { pendingWithdrawalTotals } from "./lib/withdrawals";

/** The authenticated user's balances plus derived, display-only fields. */
export const myBalance = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const available = balance?.available ?? 0;
    const invested = balance?.invested ?? 0;
    const profit = balance?.profit ?? 0;
    const pending = await pendingWithdrawalTotals(ctx, user._id);

    return {
      available,
      invested,
      profit,
      portfolioValue: available + invested + profit,
      pendingWithdrawalTotal: pending,
      availableToWithdraw: Math.max(0, available - pending.available),
      profitAvailableToWithdraw: Math.max(0, profit - pending.profit),
    };
  },
});
