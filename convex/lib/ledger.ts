import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

/**
 * `transactions` is a denormalized read-model kept alongside the
 * source-of-truth tables (deposits, investments, withdrawals, ...) purely so
 * "Transaction History" UI can do one query. Call this from the same
 * mutation that writes the source record, never on its own.
 */
export async function writeTransaction(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: Doc<"transactions">["type"];
    amount: number;
    status: string;
    relatedId?: string;
  }
) {
  await ctx.db.insert("transactions", {
    userId: args.userId,
    type: args.type,
    amount: args.amount,
    status: args.status,
    relatedId: args.relatedId,
    createdAt: Date.now(),
  });
}
