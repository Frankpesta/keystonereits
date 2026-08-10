import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getUserSessionToken } from "@/lib/auth/session";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Keystone REIT account and start participating in professionally managed real estate.",
};

export default async function SignupPage() {
  const token = await getUserSessionToken();
  if (token) {
    const alreadySignedIn = await convexServerClient()
      .query(api.users.currentUser, { sessionToken: token })
      .then(() => true)
      .catch(() => false);
    if (alreadySignedIn) redirect("/dashboard");
  }

  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
