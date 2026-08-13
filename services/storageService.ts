import { demoState } from "@/lib/demo-data";
import type { AppState, Profile } from "@/lib/types";
import { getSupabaseClient } from "@/services/supabaseClient";

export const STORAGE_PREFIX = "mindweather.user.v2";
export const STORAGE_EVENT = "mindweather:storage";

type AccountProfile = Pick<Profile, "id" | "name" | "email" | "initials">;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}.${userId}`;
}

function defaultProfile(account: AccountProfile): Profile {
  return {
    ...account,
    field: "",
    focusWindow: "",
    learningMethods: [],
    obstacles: [],
    onboarded: false,
  };
}

export function createAccountState(account: AccountProfile): AppState {
  return {
    version: demoState.version,
    profile: defaultProfile(account),
    preferences: clone(demoState.preferences),
    subjects: [{ id: "general", name: "General", color: "#8fe7dd", icon: "GE" }],
    tasks: [],
    weatherCheckins: [],
    sessions: [],
    concepts: [],
    mistakes: [],
    ghostNotes: [],
    journal: [],
    assignments: [],
    notifications: [],
    wellbeingCheckins: [],
    dna: [],
    freezeMode: false,
    currentWeather: "breezy",
  };
}

function normalize(value: Partial<AppState>, account: AccountProfile): AppState {
  const base = createAccountState(account);
  return {
    ...base,
    ...value,
    version: demoState.version,
    profile: { ...base.profile, ...(value.profile ?? {}), ...account },
    preferences: { ...base.preferences, ...(value.preferences ?? {}) },
    subjects: value.subjects?.length ? value.subjects : base.subjects,
    tasks: value.tasks ?? [],
    weatherCheckins: value.weatherCheckins ?? [],
    sessions: value.sessions ?? [],
    concepts: value.concepts ?? [],
    mistakes: value.mistakes ?? [],
    ghostNotes: value.ghostNotes ?? [],
    journal: value.journal ?? [],
    assignments: value.assignments ?? [],
    notifications: value.notifications ?? [],
    wellbeingCheckins: value.wellbeingCheckins ?? [],
    dna: value.dna ?? [],
  };
}

export const storageService = {
  load(userId: string, account: AccountProfile): AppState {
    if (typeof window === "undefined") return createAccountState(account);
    try {
      const stored = window.localStorage.getItem(storageKey(userId));
      if (!stored) return createAccountState(account);
      return normalize(JSON.parse(stored) as Partial<AppState>, account);
    } catch {
      return createAccountState(account);
    }
  },

  async loadRemote(userId: string, account: AccountProfile) {
    const { data, error } = await getSupabaseClient()
      .from("app_states")
      .select("state")
      .eq("user_id", userId)
      .maybeSingle<{ state: Partial<AppState> }>();
    if (error) throw error;
    return data?.state ? normalize(data.state, account) : null;
  },

  save(userId: string, state: AppState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { userId, state } }));
  },

  async saveRemote(userId: string, state: AppState) {
    const { error } = await getSupabaseClient().from("app_states").upsert({
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
  },

  reset(userId: string, account: AccountProfile) {
    const state = createAccountState(account);
    this.save(userId, state);
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

  clear(userId: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey(userId));
  },
};
