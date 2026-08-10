import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { randomToken, sha256Hex } from "./crypto";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(
  ctx: MutationCtx,
  args: {
    subjectId: Id<"users"> | Id<"admins">;
    subjectType: "user" | "admin";
    userAgent?: string;
  }
): Promise<{ token: string; expiresAt: number }> {
  const token = randomToken();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await ctx.db.insert("sessions", {
    subjectId: args.subjectId,
    subjectType: args.subjectType,
    tokenHash: await sha256Hex(token),
    userAgent: args.userAgent,
    expiresAt,
    createdAt: Date.now(),
  });
  return { token, expiresAt };
}

/** Defense-in-depth on password reset: invalidate every existing session. */
export async function invalidateAllSessions(ctx: MutationCtx, subjectId: string): Promise<void> {
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_subject", (q) => q.eq("subjectId", subjectId))
    .collect();
  for (const session of sessions) {
    await ctx.db.delete(session._id);
  }
}

export async function deleteSessionByToken(ctx: MutationCtx, token: string): Promise<void> {
  const tokenHash = await sha256Hex(token);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (session) await ctx.db.delete(session._id);
}
