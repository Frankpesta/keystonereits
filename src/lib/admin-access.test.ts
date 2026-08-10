import { describe, expect, it } from "vitest";
import { adminSectionForPath, canAccessAdminSection } from "./admin-access";

describe("canAccessAdminSection", () => {
  it("grants super access to every section", () => {
    for (const section of ["users", "admins", "settings", "audit-logs"] as const) {
      expect(canAccessAdminSection("super", section)).toBe(true);
    }
  });

  it("excludes finance from admins", () => {
    expect(canAccessAdminSection("finance", "admins")).toBe(false);
  });

  it("excludes support from withdrawals", () => {
    expect(canAccessAdminSection("support", "withdrawals")).toBe(false);
  });

  it("grants everyone access to overview", () => {
    expect(canAccessAdminSection("marketing", "overview")).toBe(true);
    expect(canAccessAdminSection("kyc", "overview")).toBe(true);
  });
});

describe("adminSectionForPath", () => {
  it("matches the exact overview path", () => {
    expect(adminSectionForPath("/admin")).toBe("overview");
  });

  it("matches a nested detail route to its parent section", () => {
    expect(adminSectionForPath("/admin/users/abc123")).toBe("users");
    expect(adminSectionForPath("/admin/investments/xyz")).toBe("investments");
  });

  it("does not confuse investment-plans with investments", () => {
    expect(adminSectionForPath("/admin/investment-plans")).toBe("investment-plans");
    expect(adminSectionForPath("/admin/investment-plans/plan1")).toBe("investment-plans");
  });

  it("returns null for an unknown path", () => {
    expect(adminSectionForPath("/admin/nonexistent")).toBeNull();
  });
});
