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
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
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

export function AdminLoginForm() {
  const router = useRouter();
  const adminLogin = useMutation(api.auth.adminLogin);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const result = await adminLogin(values);
      if (!result.ok) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      router.push(`/admin/verify-login?email=${encodeURIComponent(result.email)}`);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Admin sign in"
      description="Keystone REIT operations console."
      logoHref="/admin/login"
      footer={
        <Link href="/admin/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
