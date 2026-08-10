/**
 * Pure progress math for an investment's maturity timeline — kept separate
 * from rendering so the GSAP-driven progress visualization (dashboard/investments
 * detail view, Phase 5) only has to tween between values this function
 * returns, never compute them itself.
 */
export function computeInvestmentProgress(startDate: number, maturityDate: number, now: number): number {
  const total = maturityDate - startDate;
  if (total <= 0) return 1;
  const elapsed = now - startDate;
  return Math.min(1, Math.max(0, elapsed / total));
}
