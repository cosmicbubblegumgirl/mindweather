import type { AppState, PlanStep, ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
export { BLOOPY_APP_KNOWLEDGE } from "@/supabase/functions/_shared/bloopyKnowledge";

export interface BloopyLocalReply {
  text: string;
  navigateTo?: ViewId;
  actionLabel?: string;
}

const routes: { id: ViewId; aliases: string[]; label: string }[] = [
  { id: "weather", aliases: ["today", "weather", "home", "station"], label: "Today" },
  { id: "lab", aliases: ["lab", "brain weather", "signals", "channel"], label: "Brain Weather Lab" },
  { id: "plan", aliases: ["plan", "planning", "next step"], label: "Plan" },
  { id: "focus", aliases: ["focus", "timer", "sprint"], label: "Focus" },
  { id: "calendar", aliases: ["calendar", "schedule", "events"], label: "Calendar" },
  { id: "tasks", aliases: ["tasks", "assignments", "to do", "todo"], label: "Tasks" },
  { id: "resources", aliases: ["resources", "resource compass", "links", "study path"], label: "Resource Compass" },
  { id: "printables", aliases: ["print", "printable", "timetable", "workbook", "pdf"], label: "Printable Studio" },
  { id: "forecast", aliases: ["forecast", "patterns", "history"], label: "Brain Forecast" },
  { id: "notebook", aliases: ["notebook", "files", "highlights"], label: "Quirky Notebook" },
  { id: "constellation", aliases: ["constellation", "concepts", "knowledge"], label: "Knowledge Constellation" },
  { id: "garden", aliases: ["mistakes", "garden", "mistake garden"], label: "Mistake Garden" },
  { id: "notes", aliases: ["ghost notes", "past me", "notes"], label: "Ghost Notes" },
  { id: "rooms", aliases: ["rooms", "body double", "quiet room"], label: "Quiet Rooms" },
  { id: "journal", aliases: ["journal", "reflect", "reflection"], label: "Journal" },
  { id: "dna", aliases: ["study dna", "preferences", "learning patterns"], label: "Study DNA" },
  { id: "wellbeing", aliases: ["wellbeing", "rescue", "anxiety", "grounding", "stuck"], label: "Rescue tools" },
  { id: "settings", aliases: ["settings", "privacy", "account", "accessibility"], label: "Settings" },
  { id: "more", aliases: ["explore", "all tools", "features"], label: "Explore" },
];

export function matchBloopyRoute(message: string) {
  const normalized = message.toLowerCase();
  const navigationWords = /\b(open|show|take me|go to|navigate|find|where is|make|create)\b/.test(normalized);
  if (!navigationWords) return undefined;
  return routes.find((route) => route.aliases.some((alias) => normalized.includes(alias)));
}

export function localBloopyReply(message: string, state: AppState, plan: PlanStep[]): BloopyLocalReply | null {
  const normalized = message.trim().toLowerCase();
  const route = matchBloopyRoute(normalized);
  if (route) return { text: `Found it. ${route.label} is ready—no map, compass, or dramatic expedition required.`, navigateTo: route.id, actionLabel: `Open ${route.label}` };

  if (/what (should|can) i do|what now|next step|where.*start|pick.*task/.test(normalized)) {
    const next = plan[0];
    if (!next) return { text: "Your plan is unusually quiet. Add one task, or use the Brain Weather Lab to decide what kind of step fits.", navigateTo: "lab", actionLabel: "Open the Lab" };
    return { text: `Start with “${next.title}” for ${next.minutes} minutes. It fits a ${WEATHER[state.currentWeather].label.toLowerCase()} day, and you may stop when the block ends.`, navigateTo: "focus", actionLabel: "Open Focus" };
  }
  if (/how.*work|what.*mindweather|what can you do|help me navigate/.test(normalized)) {
    return { text: "I know the whole weather station. I can find any tool, pick a realistic next step, open your path-aware resources, prepare printables, or answer an online question when web search is switched on.", navigateTo: "more", actionLabel: "See every tool" };
  }
  if (/resource|study path|where.*learn/.test(normalized)) return { text: "Resource Compass ranks a small, curated library from your study field, active work, preferred ways of learning, and today’s cognitive weather.", navigateTo: "resources", actionLabel: "Open my resources" };
  if (/timetable|workbook|print|pdf/.test(normalized)) return { text: "Printable Studio can turn your current tasks and weather into a seven-day timetable or a reusable workbook. Your browser can print it or save it as a PDF.", navigateTo: "printables", actionLabel: "Make a printable" };
  if (/offline|internet|connection/.test(normalized)) return { text: "Navigation, planning, resources, focus tools, and printables still work locally. Online questions wait for a connection; protected study data syncs through Supabase when you reconnect." };
  return null;
}
