"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { clearUserSessionCookie, getUserSessionToken, setUserSessionCookie } from "@/lib/auth/session";

/**
 * Only the mutations that establish or destroy a session go through a
 * Server Action (cookies can only be set/read server-side). Every other
 * auth mutation (signup, login step 1, resend, request-reset) is called
 * directly from the client via `useMutation` — no cookie involved yet.
 *
 * verifySignupOtp/verifyLoginOtp return `{ ok, ... }` rather than throwing
 * (see convex/auth.ts) so a genuinely-unexpected exception here still means
 * something worth logging, distinct from an ordinary "wrong code".
 */

export async function verifySignupOtpAction(email: string, code: string) {
  try {
    const result = await convexServerClient().mutation(api.auth.verifySignupOtp, { email, code });
    if (!result.ok) return { error: result.error };
    await setUserSessionCookie(result.token, result.expiresAt);
  } catch (err) {
    return { error: getConvexErrorMessage(err) };
  }
  redirect("/dashboard");
}

export async function verifyLoginOtpAction(email: string, code: string) {
  try {
    const result = await convexServerClient().mutation(api.auth.verifyLoginOtp, { email, code });
    if (!result.ok) return { error: result.error };
    await setUserSessionCookie(result.token, result.expiresAt);
  } catch (err) {
    return { error: getConvexErrorMessage(err) };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const token = await getUserSessionToken();
  if (token) {
    try {
      await convexServerClient().mutation(api.auth.logout, { sessionToken: token });
    } catch {
      // Session already gone server-side — still clear the cookie below.
    }
  }
  await clearUserSessionCookie();
  redirect("/login");
}
