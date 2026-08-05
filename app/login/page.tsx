import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Log in", description: "Open your private MindWeather profile on this device." };

export default function LoginPage() {
  return <AuthPage initialMode="login" />;
}
