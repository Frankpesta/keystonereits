import type { MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { writeTransaction } from "./ledger";

/**
 * Principal-return policy (resolves the // TODO originally left in
 * convex/admin/investments.ts's `end` mutation — Phase 7 explicitly asks to
 * settle both admin-ended and naturally-matured investments together): once
 * an investment stops being active, whether by reaching natural maturity
 * (convex/investments.ts's processMaturities cron) or by an admin manually
 * ending it (convex/admin/investments.ts's `end` mutation), its principal is
 * returned to the user's available balance. Already-accrued profit needs no
 * special handling here — it was credited to balances.profit as it accrued
 * and simply stays there. This mirrors how a fixed-term investment/staking
 * product normally works (principal locked for the term, released at term
 * end); an admin who ends an investment for cause (e.g. a fraud review) can
 * immediately follow up with a manual balance debit
 * (convex/admin/users.ts's adjustBalance) to hold the returned funds — the
 * same escape hatch already documented there.
 */
export async function returnPrincipalToAvailable(
  ctx: MutationCtx,
  investment: Pick<Doc<"investments">, "_id" | "userId" | "amount">
) {
  const balance = await ctx.db
    .query("balances")
    .withIndex("by_user", (q) => q.eq("userId", investment.userId))
    .unique();
  if (!balance) return;

  await ctx.db.patch(balance._id, {
    available: balance.available + investment.amount,
    invested: Math.max(0, balance.invested - investment.amount),
    updatedAt: Date.now(),
  });
  await writeTransaction(ctx, {
    userId: investment.userId,
    type: "investment",
    amount: investment.amount,
    status: "principal_returned",
    relatedId: investment._id,
  });
}
