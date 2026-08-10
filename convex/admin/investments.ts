import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { returnPrincipalToAvailable } from "../lib/investments";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const INVESTMENT_ROLES: Doc<"admins">["role"][] = ["super", "investment"];
const STATUS = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("maturing"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("admin_paused"),
  v.literal("admin_ended")
);

export const list = query({
  args: {
    sessionToken: v.string(),
    status: v.optional(STATUS),
    planId: v.optional(v.id("investmentPlans")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, INVESTMENT_ROLES);

    let investments = args.status
      ? await ctx.db.query("investments").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").take(300)
      : args.planId
        ? await ctx.db.query("investments").withIndex("by_plan", (q) => q.eq("planId", args.planId!)).order("desc").take(300)
        : await ctx.db.query("investments").order("desc").take(300);

    if (args.status && args.planId) investments = investments.filter((i) => i.planId === args.planId);

    const term = args.search?.trim().toLowerCase();
    const withNames = await Promise.all(
      investments.map(async (inv) => {
        const [user, plan] = await Promise.all([ctx.db.get(inv.userId), ctx.db.get(inv.planId)]);
        return {
          ...inv,
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user",
          userEmail: user?.email,
          planName: plan?.name,
        };
      })
    );

    if (!term) return withNames;
    return withNames.filter(
      (inv) => inv.userName.toLowerCase().includes(term) || inv.userEmail?.toLowerCase().includes(term)
    );
  },
});

export const detail = query({
  args: { sessionToken: v.string(), investmentId: v.id("investments") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, INVESTMENT_ROLES);

    const investment = await ctx.db.get(args.investmentId);
    if (!investment) throw new ConvexError("Investment not found.");
    const [user, plan, overrides] = await Promise.all([
      ctx.db.get(investment.userId),
      ctx.db.get(investment.planId),
      ctx.db.query("investmentOverrides").withIndex("by_investment", (q) => q.eq("investmentId", args.investmentId)).order("desc").collect(),
    ]);

    return { ...investment, user, plan, overrides };
  },
});

async function applyOverride(
  ctx: MutationCtx,
  args: {
    adminId: Id<"admins">;
    investmentId: Id<"investments">;
    allowedFrom: Doc<"investments">["status"][];
    toStatus: Doc<"investments">["status"];
    action: Doc<"investmentOverrides">["action"];
    reason: string;
  }
) {
  const investment = await ctx.db.get(args.investmentId);
  if (!investment) throw new ConvexError("Investment not found.");
  if (!args.allowedFrom.includes(investment.status)) {
    throw new ConvexError(`Cannot ${args.action} an investment that is currently "${investment.status}".`);
  }

  await ctx.db.patch(args.investmentId, { status: args.toStatus });
  await ctx.db.insert("investmentOverrides", {
    investmentId: args.investmentId,
    action: args.action,
    reason: args.reason,
    performedBy: args.adminId,
    createdAt: Date.now(),
  });
  await ctx.db.insert("notifications", {
    userId: investment.userId,
    type: `investment_${args.action}`,
    title: `Investment ${args.action === "pause" ? "Paused" : args.action === "end" ? "Ended" : "Restarted"}`,
    body: reasonToNotificationBody(args.action, args.reason),
    read: false,
    createdAt: Date.now(),
  });

  await logAdminAction(ctx, {
    adminId: args.adminId,
    action: `investment_${args.action}`,
    targetType: "investment",
    targetId: args.investmentId,
    amount: investment.amount,
    before: { status: investment.status },
    after: { status: args.toStatus, reason: args.reason },
  });

  return investment;
}

function reasonToNotificationBody(action: string, reason: string): string {
  if (action === "pause") return `Your investment has been paused by our support team. Reason: ${reason}`;
  if (action === "end") return `Your investment has been ended by our support team. Reason: ${reason}`;
  return `Your investment has been restarted. Reason: ${reason}`;
}

export const pause = mutation({
  args: { sessionToken: v.string(), investmentId: v.id("investments"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, INVESTMENT_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await applyOverride(ctx, {
      adminId: admin._id,
      investmentId: args.investmentId,
      allowedFrom: ["active", "maturing"],
      toStatus: "admin_paused",
      action: "pause",
      reason,
    });
    return { ok: true as const };
  },
});

// Principal-return policy resolved in Phase 7 — see returnPrincipalToAvailable's
// docstring in convex/lib/investments.ts for the full rationale (same rule
// applied on natural maturity, kept consistent between the two paths).
export const end = mutation({
  args: { sessionToken: v.string(), investmentId: v.id("investments"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, INVESTMENT_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    const investment = await applyOverride(ctx, {
      adminId: admin._id,
      investmentId: args.investmentId,
      allowedFrom: ["active", "maturing", "admin_paused"],
      toStatus: "admin_ended",
      action: "end",
      reason,
    });
    await returnPrincipalToAvailable(ctx, investment);
    return { ok: true as const };
  },
});

export const restart = mutation({
  args: { sessionToken: v.string(), investmentId: v.id("investments"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, INVESTMENT_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await applyOverride(ctx, {
      adminId: admin._id,
      investmentId: args.investmentId,
      allowedFrom: ["admin_paused"],
      toStatus: "active",
      action: "restart",
      reason,
    });
    return { ok: true as const };
  },
});
