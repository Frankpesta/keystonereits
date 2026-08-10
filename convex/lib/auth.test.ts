// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { getCurrentAdmin, getCurrentUser, requireRole } from "./auth";
import { sha256Hex, randomToken } from "./crypto";

const DAY = 24 * 60 * 60 * 1000;

async function seedUserWithSession(
  t: ReturnType<typeof convexTest>,
  overrides: { status?: "active" | "suspended" | "restricted"; expiresInMs?: number } = {}
) {
  const token = randomToken();
  const userId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("users", {
      email: "session-user@keystonereits.com",
      passwordHash: "irrelevant",
      firstName: "Session",
      lastName: "User",
      emailVerified: true,
      status: overrides.status ?? "active",
      kycStatus: "approved",
      referralCode: "SESSION1",
      createdAt: Date.now(),
    });
    await ctx.db.insert("sessions", {
      subjectId: id,
      subjectType: "user",
      tokenHash: await sha256Hex(token),
      expiresAt: Date.now() + (overrides.expiresInMs ?? DAY),
      createdAt: Date.now(),
    });
    return id;
  });
  return { userId, token };
}

async function seedAdminWithSession(
  t: ReturnType<typeof convexTest>,
  overrides: { role?: "super" | "finance" | "support"; status?: "active" | "disabled" } = {}
) {
  const token = randomToken();
  const adminId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("admins", {
      email: "session-admin@keystonereits.com",
      passwordHash: "irrelevant",
      name: "Session Admin",
      role: overrides.role ?? "support",
      status: overrides.status ?? "active",
      createdAt: Date.now(),
    });
    await ctx.db.insert("sessions", {
      subjectId: id,
      subjectType: "admin",
      tokenHash: await sha256Hex(token),
      expiresAt: Date.now() + DAY,
      createdAt: Date.now(),
    });
    return id;
  });
  return { adminId, token };
}

describe("getCurrentUser", () => {
  it("returns the user for a valid session token", async () => {
    const t = convexTest(schema, convexTestModules);
    const { userId, token } = await seedUserWithSession(t);

    const user = await t.run((ctx) => getCurrentUser(ctx, token));
    expect(user._id).toBe(userId);
  });

  it("throws when no token is provided", async () => {
    const t = convexTest(schema, convexTestModules);
    await expect(t.run((ctx) => getCurrentUser(ctx, undefined))).rejects.toThrow(ConvexError);
    await expect(t.run((ctx) => getCurrentUser(ctx, null))).rejects.toThrow(ConvexError);
  });

  it("throws for a token that doesn't match any session", async () => {
    const t = convexTest(schema, convexTestModules);
    await seedUserWithSession(t);
    await expect(t.run((ctx) => getCurrentUser(ctx, "not-a-real-token"))).rejects.toThrow(ConvexError);
  });

  it("throws for an expired session", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedUserWithSession(t, { expiresInMs: -1 });
    await expect(t.run((ctx) => getCurrentUser(ctx, token))).rejects.toThrow(ConvexError);
  });

  it("throws for a suspended user even with a valid session", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedUserWithSession(t, { status: "suspended" });
    await expect(t.run((ctx) => getCurrentUser(ctx, token))).rejects.toThrow(ConvexError);
  });

  it("throws when a valid admin session token is presented as a user token", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedAdminWithSession(t);
    await expect(t.run((ctx) => getCurrentUser(ctx, token))).rejects.toThrow(ConvexError);
  });
});

describe("getCurrentAdmin", () => {
  it("returns the admin for a valid session token", async () => {
    const t = convexTest(schema, convexTestModules);
    const { adminId, token } = await seedAdminWithSession(t);

    const admin = await t.run((ctx) => getCurrentAdmin(ctx, token));
    expect(admin._id).toBe(adminId);
  });

  it("throws for a disabled admin even with a valid session", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedAdminWithSession(t, { status: "disabled" });
    await expect(t.run((ctx) => getCurrentAdmin(ctx, token))).rejects.toThrow(ConvexError);
  });

  it("throws when a valid user session token is presented as an admin token", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedUserWithSession(t);
    await expect(t.run((ctx) => getCurrentAdmin(ctx, token))).rejects.toThrow(ConvexError);
  });
});

describe("requireRole", () => {
  it("does not throw when the admin has an allowed role", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedAdminWithSession(t, { role: "finance" });
    const admin = await t.run((ctx) => getCurrentAdmin(ctx, token));
    expect(() => requireRole(admin, ["finance", "super"])).not.toThrow();
  });

  it("throws when the admin's role is not in the allowed list", async () => {
    const t = convexTest(schema, convexTestModules);
    const { token } = await seedAdminWithSession(t, { role: "support" });
    const admin = await t.run((ctx) => getCurrentAdmin(ctx, token));
    expect(() => requireRole(admin, ["finance", "super"])).toThrow(ConvexError);
  });
});
