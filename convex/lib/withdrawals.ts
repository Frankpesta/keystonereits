import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Withdrawal requests earmark funds against `balances` without decrementing
 * it: `balances.available`/`balances.profit` stay the source of truth, and
 * "available to withdraw" is computed as balance minus the sum of every
 * non-terminal withdrawal the user has open. This is what stops a user from
 * submitting two overlapping requests that double-spend the same balance —
 * see docs/05-user-dashboard.md's withdraw section for the rationale.
 */
const NON_TERMINAL_WITHDRAWAL_STATUSES = new Set([
  "pending",
  "under_review",
  "approved",
  "processing",
]);

export async function pendingWithdrawalTotals(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<{ available: number; profit: number }> {
  const withdrawals = await ctx.db
    .query("withdrawals")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const totals = { available: 0, profit: 0 };
  for (const w of withdrawals) {
    if (!NON_TERMINAL_WITHDRAWAL_STATUSES.has(w.status)) continue;
    totals[w.balanceSource] += w.amountUsd;
  }
  return totals;
}
