"use client";

import { demoState } from "@/lib/demo-data";
import { localPlanner } from "@/lib/planningEngine";
import type { AppState, Concept, GhostNote, JournalEntry, Mistake, PlanStep, Preferences, StudySession, StudyTask, WeatherId, WellbeingCheckin } from "@/lib/types";
import { assignmentService } from "@/services/assignmentService";
import { constellationService } from "@/services/constellationService";
import { mistakeService } from "@/services/mistakeService";
import { notificationService } from "@/services/notificationService";
import { sessionService } from "@/services/sessionService";
import { storageService } from "@/services/storageService";
import { cloudStateService } from "@/services/cloudStateService";
import { hostedAccountAvailable, supabase } from "@/lib/supabase";
import { studyDNAService } from "@/services/studyDNAService";
import { taskService } from "@/services/taskService";
import { weatherService } from "@/services/weatherService";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TaskDraft = Omit<StudyTask, "id" | "createdAt" | "actualMinutes" | "subtasks" | "conceptIds"> & { subtasks?: StudyTask["subtasks"] };

interface MindWeatherContextValue {
  state: AppState;
  hydrated: boolean;
  plan: PlanStep[];
  planDone: string[];
  celebration: number;
  selectWeather(weather: WeatherId, sliders?: { energy: number; focus: number; stress: number; motivation: number }): void;
  createTask(task: TaskDraft): void;
  updateTask(id: string, changes: Partial<StudyTask>): void;
  deleteTask(id: string): void;
  completePlanStep(step: PlanStep): void;
  toggleFreeze(): void;
  setFreeze(value: boolean): void;
  startSession(taskId?: string, minutes?: number): void;
  updateSession(changes: Partial<NonNullable<AppState["currentSession"]>>): void;
  finishSession(values: Pick<StudySession, "felt" | "focusQuality" | "completedMinutes">): void;
  addMistake(values: Omit<Mistake, "id" | "stage" | "createdAt">): void;
  growMistake(id: string): void;
  advanceConcept(id: string): void;
  addConcept(values: Omit<Concept, "id" | "level" | "confidence">): void;
  addGhostNote(values: Omit<GhostNote, "id" | "createdAt">): void;
  addJournalEntry(values: Omit<JournalEntry, "id" | "createdAt">): void;
  recordWellbeingCheckin(values: Omit<WellbeingCheckin, "id" | "createdAt">): void;
  updatePreferences(values: Partial<Preferences>): void;
  updateProfile(values: Partial<AppState["profile"]>): void;
  respondToDNA(id: string, confirmed: boolean): void;
  updateAssignmentSection(assignmentId: string, sectionId: string, changes: Parameters<typeof assignmentService.updateSection>[3]): void;
  markNotification(id: string): void;
  markAllNotifications(): void;
  downloadData(): void;
  resetDemo(): void;
  deleteData(): void;
}

const MindWeatherContext = createContext<MindWeatherContextValue | null>(null);

export function MindWeatherProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => JSON.parse(JSON.stringify(demoState)) as AppState);
  const [hydrated, setHydrated] = useState(false);
  const [planDone, setPlanDone] = useState<string[]>([]);
  const [celebration, setCelebration] = useState(0);
  const [cloudUserId, setCloudUserId] = useState<string>();

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (!hostedAccountAvailable()) {
        const localState = storageService.load();
        if (active) { setState(localState); setHydrated(true); }
        return;
      }
      const { data } = await supabase().auth.getSession();
      const user = data.session?.user;
      if (!user) {
        const localState = storageService.load();
        if (active) { setState(localState); setHydrated(true); }
        return;
      }
      const localState = storageService.load(user.id);
      try {
        const remoteState = await cloudStateService.load(user.id);
        const nextState = remoteState ?? {
          ...localState,
          profile: {
            ...localState.profile,
            id: user.id,
            email: user.email || localState.profile.email,
            name: String(user.user_metadata?.name || localState.profile.name),
          },
        };
        if (active) { setCloudUserId(user.id); setState(nextState); setHydrated(true); }
      } catch {
        if (active) { setCloudUserId(user.id); setState(localState); setHydrated(true); }
      }
    };
    void hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storageService.save(state, cloudUserId);
    if (!cloudUserId) return;
    const save = () => { void cloudStateService.save(cloudUserId, state).catch(() => undefined); };
    const timer = window.setTimeout(save, 500);
    window.addEventListener("online", save);
    return () => { window.clearTimeout(timer); window.removeEventListener("online", save); };
  }, [cloudUserId, hydrated, state]);

  const plan = useMemo(() => localPlanner.createPlan(state, state.currentWeather), [state]);

  const change = useCallback((updater: (current: AppState) => AppState) => setState((current) => updater(current)), []);

  const value = useMemo<MindWeatherContextValue>(() => ({
    state,
    hydrated,
    plan,
    planDone,
    celebration,
    selectWeather(weather, sliders = { energy: 3, focus: 3, stress: 3, motivation: 3 }) {
      change((current) => weatherService.checkIn(current, weather, sliders));
      setPlanDone([]);
      setCelebration((value) => value + 1);
    },
    createTask(task) {
      const item: StudyTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString(), actualMinutes: 0, subtasks: task.subtasks ?? [], conceptIds: [] };
      change((current) => taskService.create(current, item));
    },
    updateTask(id, changes) {
      change((current) => taskService.update(current, id, changes));
      if (changes.status === "done") setCelebration((value) => value + 1);
    },
    deleteTask(id) {
      change((current) => taskService.remove(current, id));
    },
    completePlanStep(step) {
      setPlanDone((items) => [...items, step.id]);
      if (step.taskId) {
        change((current) => {
          const task = current.tasks.find((item) => item.id === step.taskId);
          if (!task) return current;
          const undone = task.subtasks.find((item) => !item.done);
          if (undone) {
            return taskService.update(current, task.id, { subtasks: task.subtasks.map((item) => (item.id === undone.id ? { ...item, done: true } : item)), status: "working" });
          }
          return taskService.update(current, task.id, { status: "done", completedAt: new Date().toISOString() });
        });
      }
      setCelebration((value) => value + 1);
    },
    toggleFreeze() { change((current) => ({ ...current, freezeMode: !current.freezeMode })); },
    setFreeze(value) { change((current) => ({ ...current, freezeMode: value })); },
    startSession(taskId, minutes = state.currentWeather === "hyperfocus" ? 45 : state.currentWeather === "clear" ? 25 : 8) {
      change((current) => ({ ...current, currentSession: { taskId, startedAt: new Date().toISOString(), remainingSeconds: minutes * 60, totalSeconds: minutes * 60, running: true } }));
    },
    updateSession(changes) { change((current) => current.currentSession ? ({ ...current, currentSession: { ...current.currentSession, ...changes } }) : current); },
    finishSession(values) {
      change((current) => {
        if (!current.currentSession) return current;
        const task = current.tasks.find((item) => item.id === current.currentSession?.taskId);
        const session: StudySession = {
          id: crypto.randomUUID(),
          taskId: current.currentSession.taskId,
          subjectId: task?.subjectId ?? current.subjects[0].id,
          minutes: Math.round(current.currentSession.totalSeconds / 60),
          method: task?.type === "Read" ? "reading" : "practice",
          completedAt: new Date().toISOString(),
          ...values,
        };
        return sessionService.complete(current, session);
      });
      setCelebration((value) => value + 1);
    },
    addMistake(values) { change((current) => mistakeService.create(current, { ...values, id: crypto.randomUUID(), stage: 0, createdAt: new Date().toISOString() })); },
    growMistake(id) { change((current) => mistakeService.grow(current, id)); setCelebration((value) => value + 1); },
    advanceConcept(id) { change((current) => constellationService.advance(current, id)); setCelebration((value) => value + 1); },
    addConcept(values) { change((current) => ({ ...current, concepts: [...current.concepts, { ...values, id: crypto.randomUUID(), level: 0, confidence: 20 }] })); },
    addGhostNote(values) { change((current) => ({ ...current, ghostNotes: [{ ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current.ghostNotes] })); },
    addJournalEntry(values) { change((current) => ({ ...current, journal: [{ ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current.journal] })); },
    recordWellbeingCheckin(values) { change((current) => ({ ...current, wellbeingCheckins: [{ ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current.wellbeingCheckins] })); },
    updatePreferences(values) { change((current) => ({ ...current, preferences: { ...current.preferences, ...values } })); },
    updateProfile(values) { change((current) => ({ ...current, profile: { ...current.profile, ...values } })); },
    respondToDNA(id, confirmed) { change((current) => studyDNAService.respond(current, id, confirmed)); },
    updateAssignmentSection(assignmentId, sectionId, changes) { change((current) => assignmentService.updateSection(current, assignmentId, sectionId, changes)); },
    markNotification(id) { change((current) => notificationService.markRead(current, id)); },
    markAllNotifications() { change((current) => notificationService.markAllRead(current)); },
    downloadData() { storageService.download(state); },
    resetDemo() { setState(storageService.reset(cloudUserId)); setPlanDone([]); },
    deleteData() { storageService.clear(cloudUserId); if (cloudUserId) void cloudStateService.clear(cloudUserId); setState({ ...storageService.reset(cloudUserId), tasks: [], sessions: [], weatherCheckins: [], concepts: [], mistakes: [], ghostNotes: [], journal: [], notifications: [], wellbeingCheckins: [] }); },
  }), [state, hydrated, plan, planDone, celebration, change, cloudUserId]);

  return <MindWeatherContext.Provider value={value}>{children}</MindWeatherContext.Provider>;
}

export function useMindWeather() {
  const context = useContext(MindWeatherContext);
  if (!context) throw new Error("useMindWeather must be used inside MindWeatherProvider");
  return context;
}
