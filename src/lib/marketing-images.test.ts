import { describe, expect, it } from "vitest";
import { unsplashUrl } from "./marketing-images";

describe("unsplashUrl", () => {
  it("appends width, quality, and format params", () => {
    const url = unsplashUrl("https://images.unsplash.com/photo-abc", { w: 1600, q: 80 });
    expect(url).toContain("https://images.unsplash.com/photo-abc?");
    expect(url).toContain("w=1600");
    expect(url).toContain("q=80");
    expect(url).toContain("auto=format");
    expect(url).toContain("fit=crop");
  });

  it("defaults quality to 80 when omitted", () => {
    const url = unsplashUrl("https://images.unsplash.com/photo-abc", { w: 800 });
    expect(url).toContain("q=80");
  });

  it("includes height only when provided", () => {
    const withoutHeight = unsplashUrl("https://images.unsplash.com/photo-abc", { w: 800 });
    expect(withoutHeight).not.toContain("h=");

    const withHeight = unsplashUrl("https://images.unsplash.com/photo-abc", { w: 800, h: 600 });
    expect(withHeight).toContain("h=600");
  });

  it("produces a valid, parseable URL", () => {
    const url = unsplashUrl("https://images.unsplash.com/photo-abc", { w: 1200, h: 800, q: 75 });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://images.unsplash.com/photo-abc");
    expect(parsed.searchParams.get("w")).toBe("1200");
    expect(parsed.searchParams.get("h")).toBe("800");
    expect(parsed.searchParams.get("q")).toBe("75");
  });
});
