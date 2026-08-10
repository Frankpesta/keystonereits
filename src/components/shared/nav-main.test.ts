import { describe, expect, it } from "vitest";
import { isActivePath } from "@/components/shared/nav-main";

describe("isActivePath", () => {
  it("matches the root path only exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/dashboard", "/")).toBe(false);
  });

  it("matches an exact route", () => {
    expect(isActivePath("/dashboard/deposit", "/dashboard/deposit")).toBe(true);
  });

  it("matches a nested child route", () => {
    expect(isActivePath("/dashboard/deposit/crypto", "/dashboard/deposit")).toBe(true);
  });

  it("does not match a sibling route with a shared prefix", () => {
    expect(isActivePath("/dashboard/deposits-archive", "/dashboard/deposit")).toBe(false);
  });

  it("does not match an unrelated route", () => {
    expect(isActivePath("/dashboard/withdraw", "/dashboard/deposit")).toBe(false);
  });
});
