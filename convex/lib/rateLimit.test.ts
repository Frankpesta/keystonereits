// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows requests up to maxAttempts within the window", async () => {
    const t = convexTest(schema, convexTestModules);
    for (let i = 0; i < 5; i++) {
      await t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 1000 }));
    }
  });

  it("throws once the limit is exceeded within the window", async () => {
    const t = convexTest(schema, convexTestModules);
    for (let i = 0; i < 5; i++) {
      await t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 60_000 }));
    }
    await expect(
      t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 60_000 }))
    ).rejects.toThrow(ConvexError);
  });

  it("tracks distinct keys independently", async () => {
    const t = convexTest(schema, convexTestModules);
    for (let i = 0; i < 5; i++) {
      await t.run((ctx) => checkRateLimit(ctx, { key: "a", maxAttempts: 5, windowMs: 60_000 }));
    }
    // key "b" has its own budget, unaffected by "a" being exhausted.
    await expect(
      t.run((ctx) => checkRateLimit(ctx, { key: "b", maxAttempts: 5, windowMs: 60_000 }))
    ).resolves.toBeNull(); // void-returning function; Convex serializes undefined as null
  });

  it("resets the window after it expires", async () => {
    vi.useFakeTimers();
    try {
      const t = convexTest(schema, convexTestModules);
      for (let i = 0; i < 5; i++) {
        await t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 1000 }));
      }
      await expect(
        t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 1000 }))
      ).rejects.toThrow(ConvexError);

      vi.advanceTimersByTime(1001);

      await expect(
        t.run((ctx) => checkRateLimit(ctx, { key: "k", maxAttempts: 5, windowMs: 1000 }))
      ).resolves.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
