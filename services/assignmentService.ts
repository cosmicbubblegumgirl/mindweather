import type { AppState, AssignmentSection } from "@/lib/types";

export const assignmentService = {
  updateSection(state: AppState, assignmentId: string, sectionId: string, changes: Partial<AssignmentSection>): AppState {
    return {
      ...state,
      assignments: state.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, sections: assignment.sections.map((section) => (section.id === sectionId ? { ...section, ...changes } : section)) }
          : assignment,
      ),
    };
  },
};
