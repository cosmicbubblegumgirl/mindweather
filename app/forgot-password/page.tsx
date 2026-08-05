import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Reset password", description: "Choose a new local password for MindWeather." };

export default function ForgotPasswordPage() {
  return <AuthPage initialMode="reset" />;
}
