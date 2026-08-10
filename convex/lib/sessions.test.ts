// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createSession, deleteSessionByToken, invalidateAllSessions } from "./sessions";
import { sha256Hex } from "./crypto";

async function seedUser(t: ReturnType<typeof convexTest>) {
  return t.run((ctx) =>
    ctx.db.insert("users", {
      email: "session-lib@keystonereits.com",
      passwordHash: "irrelevant",
      firstName: "Session",
      lastName: "Lib",
      emailVerified: true,
      status: "active",
      kycStatus: "approved",
      referralCode: "SESSLIB1",
      createdAt: Date.now(),
    })
  );
}

describe("createSession", () => {
  it("stores only the hash of the token, never the raw token", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);

    const { token, expiresAt } = await t.run((ctx) =>
      createSession(ctx, { subjectId: userId, subjectType: "user" })
    );

    const rows = await t.run((ctx) => ctx.db.query("sessions").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).toBe(await sha256Hex(token));
    expect(rows[0].tokenHash).not.toBe(token);
    expect(rows[0].subjectType).toBe("user");
    expect(rows[0].expiresAt).toBe(expiresAt);
  });

  it("sets an expiry roughly 30 days out", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);
    const before = Date.now();

    const { expiresAt } = await t.run((ctx) => createSession(ctx, { subjectId: userId, subjectType: "user" }));

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeGreaterThan(before + thirtyDaysMs - 5000);
    expect(expiresAt).toBeLessThan(before + thirtyDaysMs + 5000);
  });
});

describe("deleteSessionByToken", () => {
  it("removes the matching session", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);
    const { token } = await t.run((ctx) => createSession(ctx, { subjectId: userId, subjectType: "user" }));

    await t.run((ctx) => deleteSessionByToken(ctx, token));

    const rows = await t.run((ctx) => ctx.db.query("sessions").collect());
    expect(rows).toHaveLength(0);
  });

  it("does nothing for an unknown token", async () => {
    const t = convexTest(schema, convexTestModules);
    await expect(t.run((ctx) => deleteSessionByToken(ctx, "unknown-token"))).resolves.toBeNull();
  });
});

describe("invalidateAllSessions", () => {
  it("removes every session for a subject and leaves others untouched", async () => {
    const t = convexTest(schema, convexTestModules);
    const userId = await seedUser(t);
    const otherUserId = await t.run((ctx) =>
      ctx.db.insert("users", {
        email: "other-session@keystonereits.com",
        passwordHash: "irrelevant",
        firstName: "Other",
        lastName: "User",
        emailVerified: true,
        status: "active",
        kycStatus: "approved",
        referralCode: "SESSLIB2",
        createdAt: Date.now(),
      })
    );

    await t.run((ctx) => createSession(ctx, { subjectId: userId, subjectType: "user" }));
    await t.run((ctx) => createSession(ctx, { subjectId: userId, subjectType: "user" }));
    await t.run((ctx) => createSession(ctx, { subjectId: otherUserId, subjectType: "user" }));

    await t.run((ctx) => invalidateAllSessions(ctx, userId));

    const remaining = await t.run((ctx) => ctx.db.query("sessions").collect());
    expect(remaining).toHaveLength(1);
    expect(remaining[0].subjectId).toBe(otherUserId);
  });
});
