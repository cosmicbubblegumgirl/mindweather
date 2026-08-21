import type { AppState, PlanStep } from "@/lib/types";
import { detectStudyPath } from "@/lib/resourceCompass";
import { getSupabaseClient, supabaseConfigured } from "@/services/supabaseClient";

export interface BloopyMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BloopySource {
  title: string;
  url: string;
}

export interface BloopyResponse {
  text: string;
  sources: BloopySource[];
  searchedWeb: boolean;
}

function contextFor(state: AppState, plan: PlanStep[]) {
  const path = detectStudyPath(state);
  return {
    learnerName: state.profile.name,
    studyField: state.profile.field,
    studyPath: path.label,
    weather: state.currentWeather,
    supportMode: state.preferences.supportMode,
    learningMethods: state.profile.learningMethods.slice(0, 6),
    subjects: state.subjects.map((subject) => subject.name).slice(0, 12),
    activeTasks: state.tasks.filter((task) => task.status !== "done").slice(0, 8).map((task) => ({ title: task.title, status: task.status, deadline: task.deadline, minutes: task.estimatedMinutes, type: task.type })),
    nextPlan: plan.slice(0, 4).map((step) => ({ title: step.title, minutes: step.minutes, reason: step.reason })),
  };
}

export const bloopyService = {
  available() {
    return supabaseConfigured();
  },

  async ask(messages: BloopyMessage[], state: AppState, plan: PlanStep[], allowWebSearch: boolean): Promise<BloopyResponse> {
    if (!supabaseConfigured()) throw new Error("Bloopy's online weather balloon is not configured yet.");
    const client = getSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) throw new Error("Please sign in again before asking Bloopy online.");
    const { data, error } = await client.functions.invoke<BloopyResponse>("bloopy", {
      body: {
        messages: messages.slice(-8),
        context: contextFor(state, plan),
        allowWebSearch,
      },
    });
    if (error) throw error;
    if (!data?.text) throw new Error("Bloopy's reply got lost in a small cloud.");
    return { text: data.text, sources: data.sources ?? [], searchedWeb: Boolean(data.searchedWeb) };
  },
};
