"use client";

import type { ViewId } from "@/lib/types";
import { BarChart3, BrainCircuit, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Flower2, Ghost, HeartPulse, NotebookPen, Settings, Smartphone, Users } from "lucide-react";

const links: { id: ViewId; label: string; detail: string; icon: typeof BarChart3 }[] = [
  { id: "tasks", label: "Tasks", detail: "All the things hanging around", icon: CheckCircle2 },
  { id: "forecast", label: "Brain Forecast", detail: "Patterns from your own history", icon: BarChart3 },
  { id: "garden", label: "Mistake Garden", detail: "Things that taught you something", icon: Flower2 },
  { id: "notes", label: "Ghost Notes", detail: "Messages from past you", icon: Ghost },
  { id: "calendar", label: "Calendar", detail: "Day, week, and month", icon: CalendarDays },
  { id: "rooms", label: "Quiet Rooms", detail: "Private body-double spaces", icon: Users },
  { id: "journal", label: "Reflection Journal", detail: "Notice what changed", icon: NotebookPen },
  { id: "dna", label: "Study DNA", detail: "Preferences, not destiny", icon: BrainCircuit },
  { id: "wellbeing", label: "Wellbeing", detail: "Gentle self-reflections and support", icon: HeartPulse },
  { id: "research", label: "Research Survey", detail: "Help shape MindWeather", icon: ClipboardList },
  { id: "mobile", label: "Mobile App", detail: "iPhone and Android install codes", icon: Smartphone },
  { id: "settings", label: "Settings & Privacy", detail: "Make the station yours", icon: Settings },
];

export function MoreView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  return <div className="more-grid">{links.map(({ id, label, detail, icon: Icon }) => <button key={id} onClick={() => navigate(id)}><span><Icon /></span><div><strong>{label}</strong><small>{detail}</small></div><ChevronRight /></button>)}</div>;
}
