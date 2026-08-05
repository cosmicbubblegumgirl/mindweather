import type { Metadata } from "next";
import { MobilePage } from "@/features/mobile/MobilePage";

export const metadata: Metadata = { title: "MindWeather on mobile", description: "Install the private MindWeather web app on iPhone, iPad, Android phones, and tablets." };

export default function MobileRoute() {
  return <MobilePage />;
}
