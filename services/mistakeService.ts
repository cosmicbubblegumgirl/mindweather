import type { AppState, Mistake } from "@/lib/types";

export const mistakeService = {
  create(state: AppState, mistake: Mistake): AppState {
    return { ...state, mistakes: [mistake, ...state.mistakes] };
  },
  grow(state: AppState, id: string): AppState {
    return { ...state, mistakes: state.mistakes.map((mistake) => (mistake.id === id ? { ...mistake, stage: Math.min(4, mistake.stage + 1) as Mistake["stage"] } : mistake)) };
  },
};
