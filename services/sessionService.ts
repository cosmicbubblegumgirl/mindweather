import type { AppState, StudySession } from "@/lib/types";

export const sessionService = {
  complete(state: AppState, session: StudySession): AppState {
    const tasks = session.taskId
      ? state.tasks.map((task) =>
          task.id === session.taskId
            ? { ...task, actualMinutes: task.actualMinutes + session.completedMinutes, status: task.status === "inbox" ? ("working" as const) : task.status }
            : task,
        )
      : state.tasks;
    return { ...state, tasks, sessions: [session, ...state.sessions], currentSession: undefined };
  },
};
