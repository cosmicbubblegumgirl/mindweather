import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Reset password", description: "Recover your secure MindWeather account." };

export default function ForgotPasswordPage() {
  return <AuthPage initialMode="reset" />;
}
