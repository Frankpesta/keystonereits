"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/lib/convex-api";
import { getConvexErrorMessage } from "@/lib/convex-error";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/validation/auth";
import { AuthCard } from "@/components/shared/auth-card";
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

export function AdminForgotPasswordForm() {
  const router = useRouter();
  const requestReset = useMutation(api.auth.adminRequestPasswordReset);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RequestPasswordResetInput) {
    setSubmitting(true);
    try {
      const { email } = await requestReset(values);
      toast.success("If that email is registered, a reset code has been sent.");
      router.push(`/admin/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your admin email and we'll send you a reset code."
      logoHref="/admin/login"
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/admin/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Sending..." : "Send reset code"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
