import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Create a profile", description: "Create a private MindWeather profile on this device." };

export default function SignupPage() {
  return <AuthPage initialMode="signup" />;
}
