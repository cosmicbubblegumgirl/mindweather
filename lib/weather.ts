import type { WeatherId } from "./types";

export const WEATHER = {
  clear: {
    label: "Clear skies",
    short: "Clear",
    description: "Focused and ready.",
    icon: "Sun",
    temperature: "25 / 5",
  },
  breezy: {
    label: "Brainy & breezy",
    short: "Breezy",
    description: "Doing okay. Attention may wander.",
    icon: "Wind",
    temperature: "18 / 4",
  },
  storm: {
    label: "Cognitive storm",
    short: "Storm",
    description: "Everything feels like a lot.",
    icon: "CloudLightning",
    temperature: "8 / 3",
  },
  battery: {
    label: "Low battery",
    short: "Low battery",
    description: "Energy is limited. Let’s spend it gently.",
    icon: "BatteryLow",
    temperature: "8 / 3",
  },
  hyperfocus: {
    label: "Hyperfocus incoming",
    short: "Hyperfocus",
    description: "There’s momentum here. Protect it.",
    icon: "Zap",
    temperature: "45 / check-in",
  },
  foggy: {
    label: "Foggy",
    short: "Foggy",
    description: "Not quite sure what is going in.",
    icon: "CloudFog",
    temperature: "12 / 4",
  },
} satisfies Record<WeatherId, { label: string; short: string; description: string; icon: string; temperature: string }>;

export function suggestWeather(values: { energy: number; focus: number; stress: number; motivation: number }): WeatherId {
  const { energy, focus, stress, motivation } = values;
  if (stress >= 4 && (focus <= 2 || energy <= 2)) return "storm";
  if (energy <= 2) return "battery";
  if (energy >= 4 && focus >= 4 && motivation >= 4) return "hyperfocus";
  if (focus <= 2 && stress <= 3) return "foggy";
  if (focus >= 4 && energy >= 3) return "clear";
  return "breezy";
}

export const weatherMessage: Record<WeatherId, string> = {
  clear: "There’s room for deep work today. Keep the edges soft.",
  breezy: "A little drift is allowed. We’ll build in easy returns.",
  storm: "We’ll make the plan smaller, quieter, and easier to enter.",
  battery: "A lighter plan still counts. Let’s protect what’s left.",
  hyperfocus: "We’ll guard the momentum without trapping you inside it.",
  foggy: "No need for a perfect map. One visible landmark is enough.",
};
