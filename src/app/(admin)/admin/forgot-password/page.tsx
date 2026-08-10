import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "./admin-forgot-password-form";

export const metadata: Metadata = {
  title: "Admin Forgot Password",
};

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
