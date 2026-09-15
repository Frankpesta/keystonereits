import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/**
 * Fans out one notification row per active admin whose role can act on the
 * triggering event — e.g. a deposit notifies finance/super, not marketing.
 * Admin table is small enough to collect() and filter in JS.
 */
export async function notifyAdminsByRole(
  ctx: MutationCtx,
  args: { roles: Doc<"admins">["role"][]; type: string; title: string; body: string; relatedId?: string }
) {
  const admins = await ctx.db.query("admins").collect();
  const now = Date.now();
  for (const admin of admins) {
    if (admin.status !== "active" || !args.roles.includes(admin.role)) continue;
    await ctx.db.insert("notifications", {
      adminId: admin._id,
      type: args.type,
      title: args.title,
      body: args.body,
      relatedId: args.relatedId,
      read: false,
      createdAt: now,
    });
  }
}
