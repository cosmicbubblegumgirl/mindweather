import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: "MindWeather — Study for the brain you have today",
  description: "MindWeather is a study-planning web app that creates realistic plans from daily energy, focus and stress check-ins, with optional Google Calendar viewing.",
};

export default function HomePage() {
  return <LandingPage />;
}
