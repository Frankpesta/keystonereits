// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { issueOtp, verifyAndConsumeOtp } from "./otp";

describe("issueOtp / verifyAndConsumeOtp", () => {
  it("issues a 6-digit code that verifies successfully", async () => {
    const t = convexTest(schema, convexTestModules);
    const code = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));

    expect(code).toMatch(/^\d{6}$/);
    const result = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code })
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejects an incorrect code", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));

    const result = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code: "000000" })
    );
    expect(result).toEqual({ ok: false });
  });

  it("cannot be verified twice (consumed codes are not reusable)", async () => {
    const t = convexTest(schema, convexTestModules);
    const code = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));
    await t.run((ctx) => verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code }));

    const result = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code })
    );
    expect(result).toEqual({ ok: false });
  });

  it("re-issuing replaces the previous unconsumed code", async () => {
    const t = convexTest(schema, convexTestModules);
    const first = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));
    const second = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));

    expect(first).not.toBe(second); // astronomically unlikely to collide, and asserts they're independent draws

    const firstResult = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code: first })
    );
    expect(firstResult).toEqual({ ok: false });

    const secondResult = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code: second })
    );
    expect(secondResult).toEqual({ ok: true });
  });

  it("rejects an expired code", async () => {
    const t = convexTest(schema, convexTestModules);
    const code = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));

    await t.run(async (ctx) => {
      const row = await ctx.db.query("otpCodes").first();
      if (row) await ctx.db.patch(row._id, { expiresAt: Date.now() - 1 });
    });

    const result = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code })
    );
    expect(result).toEqual({ ok: false });
  });

  it("locks out after 5 failed attempts even with the correct code, and the counter actually persists", async () => {
    const t = convexTest(schema, convexTestModules);
    const code = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));

    for (let i = 0; i < 5; i++) {
      const result = await t.run((ctx) =>
        verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code: "000000" })
      );
      expect(result).toEqual({ ok: false });
    }

    const rows = await t.run((ctx) => ctx.db.query("otpCodes").collect());
    expect(rows[0].attempts).toBe(5);

    const finalResult = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code })
    );
    expect(finalResult).toEqual({ ok: false });
  });

  it("keeps codes for different purposes independent", async () => {
    const t = convexTest(schema, convexTestModules);
    const signupCode = await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));
    await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "login_2fa" }));

    // The signup code is untouched by issuing a login_2fa code for the same email.
    const result = await t.run((ctx) =>
      verifyAndConsumeOtp(ctx, { email: "a@b.com", purpose: "signup_verify", code: signupCode })
    );
    expect(result).toEqual({ ok: true });
  });

  it("is rate-limited on issue", async () => {
    const t = convexTest(schema, convexTestModules);
    for (let i = 0; i < 5; i++) {
      await t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }));
    }
    await expect(
      t.run((ctx) => issueOtp(ctx, { email: "a@b.com", purpose: "signup_verify" }))
    ).rejects.toThrow();
  });
});
