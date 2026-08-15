import { query } from "./_generated/server";
import { planRequiresKyc } from "./lib/investments";

/** Public — powers the marketing site's plan cards. No auth: this is intentionally readable pre-login. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("investmentPlans")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const sorted = plans.sort((a, b) => a.minAmount - b.minAmount);
    const lowestActiveMinAmount = sorted[0]?.minAmount ?? null;
    return sorted.map((plan) => ({ ...plan, requiresKyc: planRequiresKyc(plan, lowestActiveMinAmount) }));
  },
});
