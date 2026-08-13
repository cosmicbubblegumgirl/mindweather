import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/AuthPage";

export const metadata: Metadata = { title: "Account", description: "Create or open your secure MindWeather account." };
export default function Page() { return <AuthPage />; }
