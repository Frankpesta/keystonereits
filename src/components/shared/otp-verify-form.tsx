"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useCountdown } from "@/hooks/use-countdown";
import { AuthCard } from "@/components/shared/auth-card";
import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Shared by signup verify, login 2FA (user + admin) — every screen that is
 * "enter the 6-digit code, submit, optionally resend." Password reset uses
 * <OtpInput> directly since it combines the code with new-password fields
 * on one screen instead.
 */
export function OtpVerifyForm({
  email,
  title,
  description,
  onVerify,
  onResend,
  footer,
}: {
  email: string;
  title: string;
  description?: string;
  onVerify: (code: string) => Promise<{ error?: string } | void>;
  onResend: () => Promise<{ error?: string } | void>;
  footer?: ReactNode;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, start } = useCountdown(RESEND_COOLDOWN_SECONDS);

  // A code was just sent by the previous screen — start the cooldown immediately.
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    const result = await onVerify(code);
    if (result?.error) {
      toast.error(result.error);
      setCode("");
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    const result = await onResend();
    setResending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("A new code has been sent.");
    setCode("");
    start();
  }

  return (
    <AuthCard title={title} description={description ?? `Enter the 6-digit code sent to ${email}`} footer={footer}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <OtpInput value={code} onChange={setCode} autoFocus disabled={submitting} />
        <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
          {submitting ? "Verifying..." : "Verify"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={secondsLeft > 0 || resending}
          onClick={handleResend}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : resending ? "Sending..." : "Resend code"}
        </Button>
      </form>
    </AuthCard>
  );
}
