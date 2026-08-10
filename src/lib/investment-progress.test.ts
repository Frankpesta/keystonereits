import { describe, expect, it } from "vitest";
import { computeInvestmentProgress } from "./investment-progress";

describe("computeInvestmentProgress", () => {
  it("returns 0 at the start date", () => {
    expect(computeInvestmentProgress(1000, 2000, 1000)).toBe(0);
  });

  it("returns 1 at the maturity date", () => {
    expect(computeInvestmentProgress(1000, 2000, 2000)).toBe(1);
  });

  it("returns the fractional ratio partway through", () => {
    expect(computeInvestmentProgress(0, 1000, 400)).toBe(0.4);
  });

  it("clamps to 1 past maturity", () => {
    expect(computeInvestmentProgress(0, 1000, 5000)).toBe(1);
  });

  it("clamps to 0 before the start date", () => {
    expect(computeInvestmentProgress(1000, 2000, 500)).toBe(0);
  });

  it("returns 1 for a zero-or-negative-duration investment", () => {
    expect(computeInvestmentProgress(1000, 1000, 1000)).toBe(1);
    expect(computeInvestmentProgress(1000, 500, 1000)).toBe(1);
  });
});
