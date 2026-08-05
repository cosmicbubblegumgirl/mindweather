import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Local profile", description: "Create or open a private MindWeather profile on this device." };
export default function Page() { return <AuthPage />; }
