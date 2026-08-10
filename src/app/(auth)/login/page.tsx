import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getUserSessionToken } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  const token = await getUserSessionToken();
  if (token) {
    const alreadySignedIn = await convexServerClient()
      .query(api.users.currentUser, { sessionToken: token })
      .then(() => true)
      .catch(() => false);
    if (alreadySignedIn) redirect("/dashboard");
  }

  return <LoginForm />;
}
