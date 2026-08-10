import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyLoginContent } from "./verify-login-content";

export const metadata: Metadata = {
  title: "Sign-In Verification",
};

export default function VerifyLoginPage() {
  return (
    <Suspense>
      <VerifyLoginContent />
    </Suspense>
  );
}
