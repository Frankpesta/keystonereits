"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The Convex functions in convex/*.ts take `sessionToken` as an explicit
 * arg (see convex/lib/auth.ts) rather than reading an ambient identity —
 * Convex has no cookie context. The dashboard layout (Server Component)
 * reads the httpOnly cookie and hands the raw token to this provider once;
 * every client component below it pulls the token from context instead of
 * ever touching `document.cookie` directly.
 */
const SessionTokenContext = createContext<string | null>(null);

export function SessionTokenProvider({ token, children }: { token: string; children: ReactNode }) {
  return <SessionTokenContext.Provider value={token}>{children}</SessionTokenContext.Provider>;
}

export function useSessionToken(): string {
  const token = useContext(SessionTokenContext);
  if (!token) throw new Error("useSessionToken must be used within a SessionTokenProvider");
  return token;
}
