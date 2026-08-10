import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getAdminSessionToken } from "@/lib/auth/session";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default async function AdminLoginPage() {
  const token = await getAdminSessionToken();
  if (token) {
    const alreadySignedIn = await convexServerClient()
      .query(api.admins.currentAdmin, { sessionToken: token })
      .then(() => true)
      .catch(() => false);
    if (alreadySignedIn) redirect("/admin");
  }

  return <AdminLoginForm />;
}
