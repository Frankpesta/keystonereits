import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Every admin mutation that changes a user's money or investment state must
 * call this before returning (see 00-README.md's non-negotiable rules and
 * 02-database-and-backend.md §2). Do not insert into `auditLogs` by hand.
 */
export async function logAdminAction(
  ctx: MutationCtx,
  args: {
    adminId: Id<"admins">;
    action: string;
    targetType: string;
    targetId: string;
    amount?: number;
    before?: unknown;
    after?: unknown;
  }
) {
  await ctx.db.insert("auditLogs", {
    adminId: args.adminId,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    amount: args.amount,
    before: args.before,
    after: args.after,
    createdAt: Date.now(),
  });
}
