import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Choose a new password", description: "Secure your MindWeather account with a new password." };
export default function Page() { return <AuthPage initialMode="update" />; }
