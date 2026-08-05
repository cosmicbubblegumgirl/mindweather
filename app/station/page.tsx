import type { Metadata } from "next";
import { AppShell } from "@/features/shell/AppShell";

export const metadata: Metadata = {
  title: "Weather Station",
  description: "A study plan shaped around today’s cognitive capacity.",
};

export default function StationPage() {
  return <AppShell />;
}
