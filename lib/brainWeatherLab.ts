import type { WeatherId } from "@/lib/types";

export type WeatherIntent = "do" | "settle" | "channel" | "understand" | "explore" | "survive" | "unknown";

export interface LabRecipe {
  title: string;
  forecast: string;
  focusMinutes: number;
  steps: [string, string, string];
  destination: "plan" | "focus" | "wellbeing" | "resources";
  destinationLabel: string;
}

const pace: Record<WeatherId, number> = { clear: 30, breezy: 20, storm: 8, battery: 6, hyperfocus: 45, foggy: 7 };

const weatherForecast: Record<WeatherId, string> = {
  clear: "Clear enough for a meaningful piece of work. Leave a little sky around it.",
  breezy: "Curiosity may move faster than the plan. Give it one useful direction.",
  storm: "There is energy here, but it needs a container before it needs a lecture.",
  battery: "Today is a conservation day. Minimum useful counts as real progress.",
  hyperfocus: "A strong current is available. Add a stopping point before you step in.",
  foggy: "Visibility is short. Work with what you can see from here.",
};

const intentCopy: Record<WeatherIntent, { title: string; destination: LabRecipe["destination"]; destinationLabel: string }> = {
  do: { title: "Build one visible win", destination: "plan", destinationLabel: "Open today’s plan" },
  settle: { title: "Lower the volume gently", destination: "wellbeing", destinationLabel: "Open a rescue tool" },
  channel: { title: "Give the weather a job", destination: "focus", destinationLabel: "Start a contained sprint" },
  understand: { title: "Name signals, not verdicts", destination: "wellbeing", destinationLabel: "Check in more gently" },
  explore: { title: "Take a curiosity detour", destination: "resources", destinationLabel: "Follow a useful trail" },
  survive: { title: "Make today smaller", destination: "plan", destinationLabel: "See the minimum plan" },
  unknown: { title: "Borrow a first step", destination: "plan", destinationLabel: "Show me one step" },
};

export function buildLabRecipe(weather: WeatherId, intent: WeatherIntent): LabRecipe {
  const info = intentCopy[intent];
  const minutes = intent === "settle" ? 3 : intent === "survive" ? Math.min(5, pace[weather]) : pace[weather];
  const steps: LabRecipe["steps"] = intent === "settle"
    ? ["Put both feet somewhere supported.", "Let your exhale be a little longer than your inhale.", "Choose whether you want quiet, grounding, or one tiny action."]
    : intent === "channel"
      ? ["Choose one output for this burst.", `Set a visible ${minutes}-minute edge.`, "Leave a restart note before changing direction."]
      : intent === "understand"
        ? ["Notice energy, focus, stress, and motivation separately.", "Name one body or environment signal.", "Choose what you need without forcing a perfect label."]
        : intent === "explore"
          ? ["Write the question you are actually curious about.", `Explore one reliable resource for ${minutes} minutes.`, "Pocket the next question and return with one useful note."]
          : intent === "survive"
            ? ["Remove anything that can honestly wait.", "Choose one maintenance action.", "Stop when the minimum useful version exists."]
            : intent === "unknown"
              ? ["Pick the task with the nearest consequence.", `Give it ${minutes} minutes with permission to stop.`, "Recheck the weather after the timer."]
              : ["Choose the clearest unfinished task.", `Work on its smallest visible piece for ${minutes} minutes.`, "Mark what moved and decide again."];
  return { ...info, forecast: weatherForecast[weather], focusMinutes: minutes, steps };
}
