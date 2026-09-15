import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const REVIEW_ROLES: Doc<"admins">["role"][] = ["super", "kyc", "compliance"];

const STATUS = v.union(
  v.literal("pending"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("info_required")
);

export const queue = query({
  args: { sessionToken: v.string(), status: v.optional(STATUS) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REVIEW_ROLES);

    const applications = args.status
      ? await ctx.db
          .query("kycApplications")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .take(200)
      : await ctx.db.query("kycApplications").order("desc").take(200);

    return await Promise.all(
      applications.map(async (app) => {
        const user = await ctx.db.get(app.userId);
        return { ...app, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user", userEmail: user?.email };
      })
    );
  },
});

export const detail = query({
  args: { sessionToken: v.string(), applicationId: v.id("kycApplications") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REVIEW_ROLES);

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new ConvexError("Application not found.");
    const user = await ctx.db.get(application.userId);

    return {
      ...application,
      user,
      documentUrl: await ctx.storage.getUrl(application.documentFileId),
      selfieUrl: application.selfieFileId ? await ctx.storage.getUrl(application.selfieFileId) : null,
    };
  },
});

async function reviewApplication(
  ctx: MutationCtx,
  args: {
    adminId: Id<"admins">;
    applicationId: Id<"kycApplications">;
    status: "approved" | "rejected" | "info_required";
    reviewNote?: string;
    action: string;
    notification: { title: string; body: string };
  }
) {
  const application = await ctx.db.get(args.applicationId);
  if (!application) throw new ConvexError("Application not found.");

  const before = { status: application.status, reviewNote: application.reviewNote };
  const now = Date.now();
  await ctx.db.patch(args.applicationId, {
    status: args.status,
    reviewedBy: args.adminId,
    reviewedAt: now,
    reviewNote: args.reviewNote,
  });
  await ctx.db.patch(application.userId, { kycStatus: args.status });
  await ctx.db.insert("notifications", {
    userId: application.userId,
    type: `kyc_${args.status}`,
    title: args.notification.title,
    body: args.notification.body,
    relatedId: args.applicationId,
    read: false,
    createdAt: now,
  });

  const user = await ctx.db.get(application.userId);
  if (user) {
    await ctx.scheduler.runAfter(0, internal.emailActions.sendKycStatusEmail, {
      to: user.email,
      firstName: user.firstName,
      status: args.status,
      note: args.reviewNote,
      userId: user._id,
    });
  }

  await logAdminAction(ctx, {
    adminId: args.adminId,
    action: args.action,
    targetType: "kycApplication",
    targetId: args.applicationId,
    before,
    after: { status: args.status, reviewNote: args.reviewNote },
  });
}

export const approve = mutation({
  args: { sessionToken: v.string(), applicationId: v.id("kycApplications") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REVIEW_ROLES);

    await reviewApplication(ctx, {
      adminId: admin._id,
      applicationId: args.applicationId,
      status: "approved",
      action: "kyc_approve",
      notification: {
        title: "KYC Approved",
        body: "Your identity verification was approved. You now have full account access.",
      },
    });
    return { ok: true as const };
  },
});

export const reject = mutation({
  args: { sessionToken: v.string(), applicationId: v.id("kycApplications"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REVIEW_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await reviewApplication(ctx, {
      adminId: admin._id,
      applicationId: args.applicationId,
      status: "rejected",
      reviewNote: reason,
      action: "kyc_reject",
      notification: { title: "KYC Rejected", body: reason },
    });
    return { ok: true as const };
  },
});

export const requestInfo = mutation({
  args: { sessionToken: v.string(), applicationId: v.id("kycApplications"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, REVIEW_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await reviewApplication(ctx, {
      adminId: admin._id,
      applicationId: args.applicationId,
      status: "info_required",
      reviewNote: reason,
      action: "kyc_request_info",
      notification: { title: "More Information Needed", body: reason },
    });
    return { ok: true as const };
  },
});
