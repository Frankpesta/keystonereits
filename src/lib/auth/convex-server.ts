import "server-only";
import { ConvexHttpClient } from "convex/browser";

/**
 * For Server Components/Actions/Route Handlers calling Convex directly
 * (not through the reactive client) — e.g. to set a session cookie after a
 * mutation returns a token. A fresh client per call; Convex's HTTP client is
 * cheap to construct.
 */
export function convexServerClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}
