import { demoState } from "@/lib/demo-data";
import type { AppState } from "@/lib/types";

export const STORAGE_KEY = "mindweather.local.v1";
export const STORAGE_EVENT = "mindweather:storage";

function storageKey(userId?: string) {
  return userId ? `${STORAGE_KEY}.${userId}` : STORAGE_KEY;
}

function cloneDemo(): AppState {
  return JSON.parse(JSON.stringify(demoState)) as AppState;
}

function normalize(state: Partial<AppState>): AppState {
  const base = cloneDemo();
  const subjects = [...(state.subjects ?? [])];
  for (const subject of base.subjects) {
    if (!subjects.some((item) => item.id === subject.id)) subjects.push(subject);
  }

  const tasks = [...(state.tasks ?? [])];
  for (const task of base.tasks.filter((item) => item.id.startsWith("classroom-") || item.id.startsWith("seed-task-"))) {
    if (!tasks.some((item) => item.id === task.id)) tasks.push(task);
  }

  const profile = { ...base.profile, ...(state.profile ?? {}) };
  if (profile.field === "Software Development & Design Thinking") profile.field = base.profile.field;

  return {
    ...base,
    ...state,
    subjects,
    tasks,
    preferences: { ...base.preferences, ...(state.preferences ?? {}) },
    profile,
    wellbeingCheckins: state.wellbeingCheckins ?? [],
  };
}

export const storageService = {
  load(userId?: string): AppState {
    if (typeof window === "undefined") return cloneDemo();
    try {
      const stored = window.localStorage.getItem(storageKey(userId));
      if (!stored) return cloneDemo();
      const parsed = JSON.parse(stored) as Partial<AppState>;
      return parsed.version === demoState.version ? normalize(parsed) : cloneDemo();
    } catch {
      return cloneDemo();
    }
  },

  save(state: AppState, userId?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: state }));
  },

  reset(userId?: string): AppState {
    const state = cloneDemo();
    this.save(state, userId);
    return state;
  },

  download(state: AppState) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mindweather-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  },

  clear(userId?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey(userId));
  },
};
