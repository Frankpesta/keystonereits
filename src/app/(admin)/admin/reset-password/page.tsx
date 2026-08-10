import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminResetPasswordContent } from "./admin-reset-password-content";

export const metadata: Metadata = {
  title: "Admin Reset Password",
};

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <AdminResetPasswordContent />
    </Suspense>
  );
}
