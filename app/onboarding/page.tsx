import type { Metadata } from "next";
import { OnboardingPage } from "@/features/auth/OnboardingPage";

export const metadata: Metadata = { title: "Build your Study DNA", description: "A conversational start for your MindWeather profile." };
export default function Page() { return <OnboardingPage />; }
