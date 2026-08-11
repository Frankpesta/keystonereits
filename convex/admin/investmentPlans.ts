import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import type { Doc } from "../_generated/dataModel";

const PLAN_ROLES: Doc<"admins">["role"][] = ["super", "investment"];
const STATUS = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("closed"),
  v.literal("archived")
);

function validatePlanFields(fields: { minAmount: number; maxAmount: number; durationDays: number; weeklyReturnPercent: number }) {
  if (!Number.isFinite(fields.minAmount) || fields.minAmount <= 0) throw new ConvexError("Minimum amount must be positive.");
  if (!Number.isFinite(fields.maxAmount) || fields.maxAmount <= fields.minAmount) {
    throw new ConvexError("Maximum amount must be greater than the minimum.");
  }
  if (!Number.isFinite(fields.durationDays) || fields.durationDays <= 0) throw new ConvexError("Duration must be positive.");
  if (!Number.isFinite(fields.weeklyReturnPercent) || fields.weeklyReturnPercent <= 0) {
    throw new ConvexError("Weekly return must be positive.");
  }
}

/** Every status, unlike the public investmentPlans.listActive query. */
export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, PLAN_ROLES);
    const plans = await ctx.db.query("investmentPlans").order("desc").take(200);
    return plans.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    description: v.string(),
    minAmount: v.number(),
    maxAmount: v.number(),
    durationDays: v.number(),
    weeklyReturnPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, PLAN_ROLES);
    const name = args.name.trim();
    const description = args.description.trim();
    if (!name) throw new ConvexError("Enter a plan name.");
    if (!description) throw new ConvexError("Enter a plan description.");
    validatePlanFields(args);

    const planId = await ctx.db.insert("investmentPlans", {
      name,
      description,
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      durationDays: args.durationDays,
      weeklyReturnPercent: args.weeklyReturnPercent,
      accrualFrequency: "weekly",
      status: "draft",
      createdBy: admin._id,
      createdAt: Date.now(),
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "investment_plan_create",
      targetType: "investmentPlan",
      targetId: planId,
      after: { name, minAmount: args.minAmount, maxAmount: args.maxAmount },
    });

    return { ok: true as const, planId };
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    planId: v.id("investmentPlans"),
    name: v.string(),
    description: v.string(),
    minAmount: v.number(),
    maxAmount: v.number(),
    durationDays: v.number(),
    weeklyReturnPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, PLAN_ROLES);
    const name = args.name.trim();
    const description = args.description.trim();
    if (!name) throw new ConvexError("Enter a plan name.");
    if (!description) throw new ConvexError("Enter a plan description.");
    validatePlanFields(args);

    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new ConvexError("Plan not found.");

    const before = {
      name: plan.name,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      durationDays: plan.durationDays,
      weeklyReturnPercent: plan.weeklyReturnPercent,
    };
    await ctx.db.patch(args.planId, {
      name,
      description,
      minAmount: args.minAmount,
      maxAmount: args.maxAmount,
      durationDays: args.durationDays,
      weeklyReturnPercent: args.weeklyReturnPercent,
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "investment_plan_update",
      targetType: "investmentPlan",
      targetId: args.planId,
      before,
      after: {
        name,
        minAmount: args.minAmount,
        maxAmount: args.maxAmount,
        durationDays: args.durationDays,
        weeklyReturnPercent: args.weeklyReturnPercent,
      },
    });

    return { ok: true as const };
  },
});

export const setStatus = mutation({
  args: { sessionToken: v.string(), planId: v.id("investmentPlans"), status: STATUS },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, PLAN_ROLES);

    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new ConvexError("Plan not found.");

    await ctx.db.patch(args.planId, { status: args.status });
    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "investment_plan_status_update",
      targetType: "investmentPlan",
      targetId: args.planId,
      before: { status: plan.status },
      after: { status: args.status },
    });

    return { ok: true as const };
  },
});
