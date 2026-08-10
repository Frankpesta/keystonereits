import { z } from "zod";

/**
 * Shared between client forms (react-hook-form + zodResolver) and the
 * Convex mutations in convex/auth.ts, which re-run these same schemas
 * server-side — client validation alone is never trusted.
 */

export const emailSchema = z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
export const otpCodeSchema = z
  .string()
  .trim()
  .length(6, "Enter the 6-digit code")
  .regex(/^\d{6}$/, "Code must be 6 digits");

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: emailSchema,
    phone: z.string().trim().optional(),
    country: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
    referralCode: z.string().trim().optional(),
    termsAccepted: z.literal(true, {
      error: "You must accept the Terms and Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: otpCodeSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
