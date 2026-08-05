import { localPlanner } from "@/lib/planningEngine";
import type { AppState } from "@/lib/types";

export const forecastService = {
  observations(state: AppState) {
    return localPlanner.forecast(state);
  },
  completionRate(state: AppState) {
    if (!state.sessions.length) return 0;
    return Math.round((state.sessions.filter((session) => session.completedMinutes >= session.minutes * 0.8).length / state.sessions.length) * 100);
  },
};
