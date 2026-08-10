import type { TestConvex } from "convex-test";
import type schema from "../schema";
import { hashPassword } from "./password";
import { createSession } from "./sessions";
import { randomReferralCode } from "./crypto";
import type { Doc } from "../_generated/dataModel";

/**
 * Shared across every Phase 5+ test file that needs an authenticated user —
 * inserts the user + balances rows directly (bypassing signup/OTP, which
 * auth.test.ts already covers) and mints a real session token the same way
 * `createSession` does in production, so `getCurrentUser` accepts it as-is.
 */
let counter = 0;

export async function createVerifiedUser(
  t: TestConvex<typeof schema>,
  overrides: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    kycStatus: Doc<"users">["kycStatus"];
    available: number;
    invested: number;
    profit: number;
  }> = {}
): Promise<{ user: Doc<"users">; sessionToken: string }> {
  counter += 1;
  const email = overrides.email ?? `user${counter}@example.com`;

  const userId = await t.run(async (ctx) =>
    ctx.db.insert("users", {
      email,
      passwordHash: await hashPassword("SuperSecret1"),
      firstName: overrides.firstName ?? "Jane",
      lastName: overrides.lastName ?? "Doe",
      emailVerified: true,
      status: "active",
      kycStatus: overrides.kycStatus ?? "not_started",
      referralCode: randomReferralCode(),
      createdAt: Date.now(),
    })
  );

  await t.run((ctx) =>
    ctx.db.insert("balances", {
      userId,
      available: overrides.available ?? 0,
      invested: overrides.invested ?? 0,
      profit: overrides.profit ?? 0,
      updatedAt: Date.now(),
    })
  );

  const { token } = await t.run((ctx) =>
    createSession(ctx, { subjectId: userId, subjectType: "user" })
  );

  const user = await t.run((ctx) => ctx.db.get(userId));
  if (!user) throw new Error("failed to load just-created test user");

  return { user, sessionToken: token };
}

export async function createAdmin(
  t: TestConvex<typeof schema>,
  overrides: Partial<{ email: string; name: string; role: Doc<"admins">["role"]; status: Doc<"admins">["status"] }> = {}
): Promise<{ admin: Doc<"admins">; sessionToken: string }> {
  counter += 1;
  const email = overrides.email ?? `admin${counter}@example.com`;

  const adminId = await t.run(async (ctx) =>
    ctx.db.insert("admins", {
      email,
      passwordHash: await hashPassword("SuperSecret1"),
      name: overrides.name ?? "Admin User",
      role: overrides.role ?? "super",
      status: overrides.status ?? "active",
      createdAt: Date.now(),
    })
  );

  const { token } = await t.run((ctx) =>
    createSession(ctx, { subjectId: adminId, subjectType: "admin" })
  );

  const admin = await t.run((ctx) => ctx.db.get(adminId));
  if (!admin) throw new Error("failed to load just-created test admin");

  return { admin, sessionToken: token };
}
