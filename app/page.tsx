import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: "Study for the brain you have today",
  description: "Your timetable shouldn’t assume your brain feels the same every day.",
};

export default function HomePage() {
  return <LandingPage />;
}
