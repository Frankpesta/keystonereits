"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/lib/convex-api";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";
import { AuthCard } from "@/components/shared/auth-card";
import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AdminResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resetPassword = useMutation(api.auth.adminResetPassword);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, code: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!email) router.replace("/admin/forgot-password");
  }, [email, router]);

  if (!email) return null;

  async function onSubmit(values: ResetPasswordInput) {
    setSubmitting(true);
    try {
      const result = await resetPassword(values);
      if (!result.ok) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      toast.success("Password updated. Please sign in.");
      router.push("/admin/login");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description={`Enter the code sent to ${email} and choose a new password.`}
      logoHref="/admin/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <OtpInput value={field.value} onChange={field.onChange} autoFocus disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
