import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { sha256Hex } from "./crypto";

type Ctx = QueryCtx | MutationCtx;

/**
 * Every gated query/mutation takes `sessionToken` as an explicit arg (the raw
 * value of the `keystone_user_session` / `keystone_admin_session` cookie) —
 * Convex functions have no ambient request/cookie context. Phase 3 owns how
 * that raw token reaches the client-side Convex calls without exposing the
 * httpOnly cookie to JS directly (e.g. a Server Component reads the cookie
 * and hands the token to client components via props/context, never via
 * `document.cookie`).
 */

async function loadSession(ctx: Ctx, sessionToken: string, subjectType: "user" | "admin") {
  const tokenHash = await sha256Hex(sessionToken);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.subjectType !== subjectType || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}

export async function getCurrentUser(
  ctx: Ctx,
  sessionToken: string | undefined | null
): Promise<Doc<"users">> {
  if (!sessionToken) throw new ConvexError("Not authenticated");
  const session = await loadSession(ctx, sessionToken, "user");
  if (!session) throw new ConvexError("Not authenticated");
  const user = await ctx.db.get(session.subjectId as Id<"users">);
  if (!user || user.status !== "active") throw new ConvexError("Not authenticated");
  return user;
}

export async function getCurrentAdmin(
  ctx: Ctx,
  sessionToken: string | undefined | null
): Promise<Doc<"admins">> {
  if (!sessionToken) throw new ConvexError("Not authenticated");
  const session = await loadSession(ctx, sessionToken, "admin");
  if (!session) throw new ConvexError("Not authenticated");
  const admin = await ctx.db.get(session.subjectId as Id<"admins">);
  if (!admin || admin.status !== "active") throw new ConvexError("Not authenticated");
  return admin;
}

export function requireRole(admin: Doc<"admins">, roles: Doc<"admins">["role"][]) {
  if (!roles.includes(admin.role)) {
    throw new ConvexError("Forbidden: insufficient role");
  }
}
