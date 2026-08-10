import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

// Statuses from which a (re)submission is allowed. "pending"/"under_review"
// are already in an admin's queue; "approved" never needs resubmission.
const RESUBMITTABLE_STATUSES = new Set(["not_started", "rejected", "info_required"]);

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx, args.sessionToken);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submit = mutation({
  args: {
    sessionToken: v.string(),
    fullName: v.string(),
    dateOfBirth: v.string(),
    address: v.string(),
    documentType: v.string(),
    documentFileId: v.id("_storage"),
    selfieFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    if (!RESUBMITTABLE_STATUSES.has(user.kycStatus)) {
      throw new ConvexError("Your KYC application is already submitted and awaiting review.");
    }
    if (!args.fullName.trim() || !args.dateOfBirth.trim() || !args.address.trim() || !args.documentType.trim()) {
      throw new ConvexError("Please complete every required field.");
    }

    const existing = await ctx.db
      .query("kycApplications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const fields = {
      status: "pending" as const,
      fullName: args.fullName.trim(),
      dateOfBirth: args.dateOfBirth,
      address: args.address.trim(),
      documentType: args.documentType,
      documentFileId: args.documentFileId,
      selfieFileId: args.selfieFileId,
      reviewedBy: undefined,
      reviewNote: undefined,
      submittedAt: Date.now(),
      reviewedAt: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("kycApplications", { userId: user._id, ...fields });
    }
    await ctx.db.patch(user._id, { kycStatus: "pending" });

    return { ok: true as const };
  },
});

export const myApplication = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const application = await ctx.db
      .query("kycApplications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!application) return null;

    return {
      ...application,
      documentUrl: await ctx.storage.getUrl(application.documentFileId),
      selfieUrl: application.selfieFileId ? await ctx.storage.getUrl(application.selfieFileId) : null,
    };
  },
});
