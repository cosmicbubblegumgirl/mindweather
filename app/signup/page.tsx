import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Create an account", description: "Create your private MindWeather account." };

export default function SignupPage() {
  return <AuthPage initialMode="signup" />;
}
