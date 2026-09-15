import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

const EMAIL_ROLES: Doc<"admins">["role"][] = ["super", "marketing"];
const RECIPIENT_CAP = 500;

const SEGMENT = v.union(
  v.literal("all"),
  v.literal("kyc_approved"),
  v.literal("kyc_pending"),
  v.literal("active_investors"),
  v.literal("has_deposited"),
  v.literal("has_not_invested"),
  v.literal("referral_users")
);
type Segment = Infer<typeof SEGMENT>;

/**
 * Real Convex queries per segment, not a hardcoded recipient list — see
 * docs/06-admin-dashboard.md. Bounded full-table scans, same dev/MVP-scale
 * tradeoff noted in convex/admin/dashboard.ts.
 */
async function resolveSegmentUsers(ctx: QueryCtx, segment: Segment): Promise<Doc<"users">[]> {
  const users = await ctx.db.query("users").collect();
  switch (segment) {
    case "all":
      return users;
    case "kyc_approved":
      return users.filter((u) => u.kycStatus === "approved");
    case "kyc_pending":
      return users.filter((u) => u.kycStatus === "pending" || u.kycStatus === "under_review");
    case "active_investors": {
      const investments = await ctx.db.query("investments").collect();
      const activeIds = new Set(
        investments.filter((i) => i.status === "active" || i.status === "maturing").map((i) => i.userId)
      );
      return users.filter((u) => activeIds.has(u._id));
    }
    case "has_deposited": {
      const deposits = await ctx.db.query("deposits").withIndex("by_status", (q) => q.eq("status", "credited")).collect();
      const depositedIds = new Set(deposits.map((d) => d.userId));
      return users.filter((u) => depositedIds.has(u._id));
    }
    case "has_not_invested": {
      const investments = await ctx.db.query("investments").collect();
      const investedIds = new Set(investments.map((i) => i.userId));
      return users.filter((u) => !investedIds.has(u._id));
    }
    case "referral_users": {
      const referrerIds = new Set(users.filter((u) => u.referredBy).map((u) => u.referredBy));
      return users.filter((u) => referrerIds.has(u._id));
    }
    default:
      return [];
  }
}

export const segmentCounts = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, EMAIL_ROLES);

    const segments: Segment[] = [
      "all",
      "kyc_approved",
      "kyc_pending",
      "active_investors",
      "has_deposited",
      "has_not_invested",
      "referral_users",
    ];
    const counts = await Promise.all(
      segments.map(async (segment) => ({ segment, count: (await resolveSegmentUsers(ctx, segment)).length }))
    );
    return counts;
  },
});

export const send = mutation({
  args: {
    sessionToken: v.string(),
    subject: v.string(),
    body: v.string(),
    target: v.union(
      v.object({ mode: v.literal("individual"), userId: v.id("users") }),
      v.object({ mode: v.literal("segment"), segment: SEGMENT })
    ),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, EMAIL_ROLES);

    const subject = args.subject.trim();
    const body = args.body.trim();
    if (!subject) throw new ConvexError("Enter a subject.");
    if (!body) throw new ConvexError("Enter a message body.");

    let recipients: Doc<"users">[];
    let campaignId: string | undefined;
    if (args.target.mode === "individual") {
      const user = await ctx.db.get(args.target.userId);
      if (!user) throw new ConvexError("User not found.");
      recipients = [user];
    } else {
      recipients = (await resolveSegmentUsers(ctx, args.target.segment)).slice(0, RECIPIENT_CAP);
      campaignId = `${args.target.segment}-${Date.now()}`;
    }
    if (recipients.length === 0) throw new ConvexError("No recipients match this target.");

    for (const recipient of recipients) {
      await ctx.scheduler.runAfter(0, internal.emailActions.sendAdminBroadcastEmail, {
        to: recipient.email,
        subject,
        body,
        firstName: recipient.firstName,
        userId: recipient._id,
        campaignId,
      });
    }

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "email_send",
      targetType: campaignId ?? "user",
      targetId: campaignId ?? recipients[0]._id,
      amount: recipients.length,
      after: { subject, target: args.target },
    });

    return { ok: true as const, recipientCount: recipients.length };
  },
});

export const history = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, EMAIL_ROLES);
    return await ctx.db.query("emailLog").order("desc").take(100);
  },
});
