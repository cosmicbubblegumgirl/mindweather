import type { AppState } from "@/lib/types";

export const studyDNAService = {
  respond(state: AppState, id: string, confirmed: boolean): AppState {
    return { ...state, dna: state.dna.map((metric) => (metric.id === id ? { ...metric, confirmed, value: confirmed ? Math.min(100, metric.value + 3) : Math.max(10, metric.value - 12) } : metric)) };
  },
};
