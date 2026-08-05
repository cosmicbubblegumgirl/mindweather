import type { AppState, StudyTask } from "@/lib/types";

export const taskService = {
  create(state: AppState, task: StudyTask): AppState {
    return { ...state, tasks: [task, ...state.tasks] };
  },
  update(state: AppState, id: string, changes: Partial<StudyTask>): AppState {
    return { ...state, tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...changes } : task)) };
  },
  remove(state: AppState, id: string): AppState {
    return { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
  },
};
