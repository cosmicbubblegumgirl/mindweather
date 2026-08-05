import type { AppState, Concept } from "@/lib/types";

export const constellationService = {
  advance(state: AppState, id: string): AppState {
    return {
      ...state,
      concepts: state.concepts.map((concept) =>
        concept.id === id
          ? { ...concept, level: Math.min(4, concept.level + 1) as Concept["level"], confidence: Math.min(100, concept.confidence + 12) }
          : concept,
      ),
    };
  },
};
