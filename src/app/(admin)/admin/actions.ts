"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getConvexErrorMessage } from "@/lib/convex-error";
import {
  clearAdminSessionCookie,
  getAdminSessionToken,
  setAdminSessionCookie,
  setUserSessionCookie,
} from "@/lib/auth/session";

export async function adminVerifyLoginOtpAction(email: string, code: string) {
  try {
    const result = await convexServerClient().mutation(api.auth.adminVerifyLoginOtp, { email, code });
    if (!result.ok) return { error: result.error };
    await setAdminSessionCookie(result.token, result.expiresAt);
  } catch (err) {
    return { error: getConvexErrorMessage(err) };
  }
  redirect("/admin");
}

export async function adminLogoutAction() {
  const token = await getAdminSessionToken();
  if (token) {
    try {
      await convexServerClient().mutation(api.auth.adminLogout, { sessionToken: token });
    } catch {
      // Session already gone server-side — still clear the cookie below.
    }
  }
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

/**
 * "Login as user": mints a real user session cookie in the current browser
 * and sends it straight to the dashboard. The form that calls this sets
 * `target="_blank"` so it opens in a new tab, leaving the admin's own
 * session in the original tab untouched. Nothing here notifies the user —
 * see convex/admin/users.ts's `impersonate` mutation.
 */
export async function impersonateUserAction(userId: Id<"users">) {
  const adminToken = await getAdminSessionToken();
  if (!adminToken) redirect("/admin/login");

  const result = await convexServerClient().mutation(api.admin.users.impersonate, {
    sessionToken: adminToken,
    userId,
  });
  await setUserSessionCookie(result.token, result.expiresAt);
  redirect("/dashboard");
}
