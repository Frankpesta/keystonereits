import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import type { Doc } from "../_generated/dataModel";

const REPORT_ROLES: Doc<"admins">["role"][] = ["super", "finance", "compliance"];
// Bounded scans for CSV export at dev/MVP scale — see convex/admin/dashboard.ts's note;
// swap for a Convex action + cursor-driven export if a real dataset outgrows this.
const REPORT_ROW_CAP = 1000;

function withinRange(ms: number, fromDate?: number, toDate?: number): boolean {
  if (fromDate !== undefined && ms < fromDate) return false;
  if (toDate !== undefined && ms > toDate) return false;
  return true;
}

export const userReport = query({
  args: {
    sessionToken: v.string(),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
    kycStatus: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REPORT_ROLES);

    const users = await ctx.db.query("users").order("desc").take(REPORT_ROW_CAP);
    const filtered = users.filter(
      (u) =>
        withinRange(u.createdAt, args.fromDate, args.toDate) &&
        (!args.kycStatus || u.kycStatus === args.kycStatus) &&
        (!args.status || u.status === args.status)
    );

    return await Promise.all(
      filtered.map(async (u) => {
        const balance = await ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", u._id)).unique();
        return {
          userId: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          status: u.status,
          kycStatus: u.kycStatus,
          available: balance?.available ?? 0,
          invested: balance?.invested ?? 0,
          profit: balance?.profit ?? 0,
          createdAt: u.createdAt,
        };
      })
    );
  },
});

export const financialReport = query({
  args: {
    sessionToken: v.string(),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REPORT_ROLES);

    const transactions = await ctx.db.query("transactions").order("desc").take(REPORT_ROW_CAP);
    const filtered = transactions.filter(
      (t) =>
        withinRange(t.createdAt, args.fromDate, args.toDate) &&
        (!args.type || t.type === args.type) &&
        (!args.status || t.status === args.status)
    );

    return await Promise.all(
      filtered.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user", userEmail: user?.email };
      })
    );
  },
});

export const investmentReport = query({
  args: {
    sessionToken: v.string(),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
    planId: v.optional(v.id("investmentPlans")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REPORT_ROLES);

    const investments = args.planId
      ? await ctx.db.query("investments").withIndex("by_plan", (q) => q.eq("planId", args.planId!)).order("desc").take(REPORT_ROW_CAP)
      : await ctx.db.query("investments").order("desc").take(REPORT_ROW_CAP);

    const filtered = investments.filter(
      (i) => withinRange(i.createdAt, args.fromDate, args.toDate) && (!args.status || i.status === args.status)
    );

    return await Promise.all(
      filtered.map(async (i) => {
        const [user, plan] = await Promise.all([ctx.db.get(i.userId), ctx.db.get(i.planId)]);
        return {
          ...i,
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user",
          userEmail: user?.email,
          planName: plan?.name,
        };
      })
    );
  },
});
