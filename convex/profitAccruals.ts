import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

/** Daily accrual totals across all of the user's investments, for the profit chart. */
export const chartSeries = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const rows = await ctx.db
      .query("profitAccruals")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(180);

    const byDate = new Map<string, number>();
    for (const row of rows) {
      byDate.set(row.accrualDate, (byDate.get(row.accrualDate) ?? 0) + row.amount);
    }
    return Array.from(byDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const history = query({
  args: { sessionToken: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const page = await ctx.db
      .query("profitAccruals")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const items = await Promise.all(
      page.page.map(async (row) => ({ ...row, plan: await ctx.db.get(row.planId) }))
    );
    return { ...page, page: items };
  },
});

export const totalEarned = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    // Bounded per-user, same reasoning as lib/withdrawals.ts's earmark sum:
    // one user's lifetime accrual row count stays small enough to collect.
    const rows = await ctx.db
      .query("profitAccruals")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .collect();
    return rows.reduce((sum, row) => sum + row.amount, 0);
  },
});
