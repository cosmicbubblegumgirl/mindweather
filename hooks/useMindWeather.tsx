"use client";

import { localPlanner } from "@/lib/planningEngine";
import type { AppState, Concept, GhostNote, JournalEntry, Mistake, PlanStep, Preferences, StudySession, StudyTask, WeatherId, WellbeingCheckin } from "@/lib/types";
import type { AuthAccount } from "@/services/authService";
import { authService } from "@/services/authService";
import { assignmentService } from "@/services/assignmentService";
import { constellationService } from "@/services/constellationService";
import { mistakeService } from "@/services/mistakeService";
import { notificationService } from "@/services/notificationService";
import { sessionService } from "@/services/sessionService";
import { createAccountState, storageService } from "@/services/storageService";
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
  activateAccount(account: AuthAccount): Promise<void>;
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
  updateSubjects(names: string[]): void;
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
  const [state, setState] = useState<AppState>(() => createAccountState({ id: "anonymous", name: "Learner", email: "", initials: "MW" }));
  const [hydrated, setHydrated] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [planDone, setPlanDone] = useState<string[]>([]);
  const [celebration, setCelebration] = useState(0);

  const activateAccount = useCallback(async (account: AuthAccount) => {
    const accountProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      initials: account.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "MW",
    };
    setHydrated(false);
    setActiveUserId(account.id);
    const localState = storageService.load(account.id, accountProfile);
    let nextState = localState;
    try {
      const remoteState = await storageService.loadRemote(account.id, accountProfile);
      if (remoteState) nextState = remoteState;
      else await storageService.saveRemote(account.id, localState);
    } catch (error) {
      console.error("MindWeather could not load the protected cloud copy.", error);
    }
    storageService.save(account.id, nextState);
    setState(nextState);
    setHydrated(true);
  }, []);

  useEffect(() => {
    let active = true;
    void authService.current().then((account) => {
      if (!active) return;
      if (account) void activateAccount(account);
      else setHydrated(true);
    });
    return () => { active = false; };
  }, [activateAccount]);

  useEffect(() => authService.onRecovery(() => {
    if (window.location.pathname.endsWith("/forgot-password/") || window.location.pathname.endsWith("/forgot-password")) return;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.location.replace(`${basePath}/forgot-password/`);
  }), []);

  useEffect(() => {
    if (!hydrated || !activeUserId) return;
    storageService.save(activeUserId, state);
    const timer = window.setTimeout(() => {
      void storageService.saveRemote(activeUserId, state).catch((error) => {
        console.error("MindWeather could not sync the protected cloud copy.", error);
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [activeUserId, hydrated, state]);

  useEffect(() => {
    if (!hydrated || !activeUserId) return;
    const timer = window.setTimeout(() => {
      void authService.updateProfile(activeUserId, state.profile).catch((error) => {
        console.error("MindWeather could not sync the account profile.", error);
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [activeUserId, hydrated, state.profile]);

  const plan = useMemo(() => localPlanner.createPlan(state, state.currentWeather), [state]);

  const change = useCallback((updater: (current: AppState) => AppState) => setState((current) => updater(current)), []);

  const value = useMemo<MindWeatherContextValue>(() => ({
    state,
    hydrated,
    plan,
    planDone,
    celebration,
    activateAccount,
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
          subjectId: task?.subjectId ?? current.subjects[0]?.id ?? "general",
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
    updateSubjects(names) {
      const colors = ["#8fe7dd", "#ffb58b", "#d6c377", "#c7b8ff", "#ffd7e5"];
      change((current) => ({
        ...current,
        subjects: names.filter(Boolean).map((name, index) => {
          const existing = current.subjects.find((subject) => subject.name.toLowerCase() === name.toLowerCase());
          return existing ?? {
            id: crypto.randomUUID(),
            name,
            color: colors[index % colors.length],
            icon: name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "ST",
          };
        }),
      }));
    },
    respondToDNA(id, confirmed) { change((current) => studyDNAService.respond(current, id, confirmed)); },
    updateAssignmentSection(assignmentId, sectionId, changes) { change((current) => assignmentService.updateSection(current, assignmentId, sectionId, changes)); },
    markNotification(id) { change((current) => notificationService.markRead(current, id)); },
    markAllNotifications() { change((current) => notificationService.markAllRead(current)); },
    downloadData() { storageService.download(state); },
    resetDemo() {
      if (!activeUserId) return;
      setState(storageService.reset(activeUserId, state.profile));
      setPlanDone([]);
    },
    deleteData() {
      if (!activeUserId) return;
      storageService.clear(activeUserId);
      setState(createAccountState(state.profile));
    },
  }), [state, hydrated, plan, planDone, celebration, activateAccount, activeUserId, change]);

  return <MindWeatherContext.Provider value={value}>{children}</MindWeatherContext.Provider>;
}

export function useMindWeather() {
  const context = useContext(MindWeatherContext);
  if (!context) throw new Error("useMindWeather must be used inside MindWeatherProvider");
  return context;
}
