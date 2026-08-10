import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminVerifyLoginContent } from "./admin-verify-login-content";

export const metadata: Metadata = {
  title: "Admin Sign-In Verification",
};

export default function AdminVerifyLoginPage() {
  return (
    <Suspense>
      <AdminVerifyLoginContent />
    </Suspense>
  );
}
