"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { OtpVerifyForm } from "@/components/shared/otp-verify-form";
import { adminVerifyLoginOtpAction } from "../actions";

export function AdminVerifyLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resend = useMutation(api.auth.adminResendLoginOtp);

  useEffect(() => {
    if (!email) router.replace("/admin/login");
  }, [email, router]);

  if (!email) return null;

  return (
    <OtpVerifyForm
      email={email}
      title="Enter your sign-in code"
      onVerify={(code) => adminVerifyLoginOtpAction(email, code)}
      onResend={async () => {
        try {
          await resend({ email });
        } catch (err) {
          return { error: getConvexErrorMessage(err) };
        }
      }}
    />
  );
}
