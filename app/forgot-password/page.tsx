import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Reset password", description: "Reset your MindWeather account password." };

export default function ForgotPasswordPage() {
  return <AuthPage initialMode="reset" />;
}
