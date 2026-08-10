"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getConvexErrorMessage } from "@/lib/convex-error";
import {
  clearAdminSessionCookie,
  getAdminSessionToken,
  setAdminSessionCookie,
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
