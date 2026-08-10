"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { OtpVerifyForm } from "@/components/shared/otp-verify-form";
import { verifySignupOtpAction } from "../actions";

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resend = useMutation(api.auth.resendSignupOtp);

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  if (!email) return null;

  return (
    <OtpVerifyForm
      email={email}
      title="Verify your email"
      onVerify={(code) => verifySignupOtpAction(email, code)}
      onResend={async () => {
        try {
          await resend({ email });
        } catch (err) {
          return { error: getConvexErrorMessage(err) };
        }
      }}
      footer={<span>Entered the wrong email? Go back to sign up.</span>}
    />
  );
}
