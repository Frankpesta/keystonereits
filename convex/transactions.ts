import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const TYPE = v.union(
  v.literal("deposit"),
  v.literal("investment"),
  v.literal("profit_accrual"),
  v.literal("withdrawal"),
  v.literal("referral_earning"),
  v.literal("admin_adjustment"),
  v.literal("fee")
);

export const myTransactions = query({
  args: {
    sessionToken: v.string(),
    paginationOpts: paginationOptsValidator,
    type: v.optional(TYPE),
    status: v.optional(v.string()),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);

    let dbQuery = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc");

    const hasFilter =
      args.type !== undefined ||
      args.status !== undefined ||
      args.fromDate !== undefined ||
      args.toDate !== undefined;

    if (hasFilter) {
      dbQuery = dbQuery.filter((q) => {
        const parts = [];
        if (args.type !== undefined) parts.push(q.eq(q.field("type"), args.type));
        if (args.status !== undefined) parts.push(q.eq(q.field("status"), args.status));
        if (args.fromDate !== undefined) parts.push(q.gte(q.field("createdAt"), args.fromDate));
        if (args.toDate !== undefined) parts.push(q.lte(q.field("createdAt"), args.toDate));
        return parts.reduce((acc, part) => q.and(acc, part));
      });
    }

    return await dbQuery.paginate(args.paginationOpts);
  },
});
