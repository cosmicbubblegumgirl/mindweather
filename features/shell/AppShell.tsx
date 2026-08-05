"use client";

import { Bloop, type BloopMood } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
import { CalendarView } from "@/features/calendar/CalendarView";
import { ConstellationView } from "@/features/constellation/ConstellationView";
import { ForecastView } from "@/features/forecast/ForecastView";
import { FocusView } from "@/features/focus/FocusView";
import { GardenView } from "@/features/garden/GardenView";
import { JournalView } from "@/features/journal/JournalView";
import { MoreView } from "@/features/more/MoreView";
import { NotesView } from "@/features/notes/NotesView";
import { PlanView } from "@/features/plan/PlanView";
import { RoomsView } from "@/features/rooms/RoomsView";
import { ResearchSurveyView } from "@/features/research/ResearchSurveyView";
import { SettingsView } from "@/features/settings/SettingsView";
import { StudyDNAView } from "@/features/study-dna/StudyDNAView";
import { TasksView } from "@/features/tasks/TasksView";
import { WeatherStation } from "@/features/weather/WeatherStation";
import { WellbeingView } from "@/features/wellbeing/WellbeingView";
import {
  BarChart3, Bell, BrainCircuit, CalendarDays, CheckCircle2, CloudSun, Command, Download, Flower2,
  Focus, Ghost, Grid2X2, Leaf, ListTodo, MoonStar, NotebookPen, PanelLeftClose, Search, Settings,
  ClipboardList, HeartPulse, Sparkles, TimerReset, Users, WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const nav: { id: ViewId; label: string; icon: typeof CloudSun; primary?: boolean }[] = [
  { id: "weather", label: "Weather", icon: CloudSun, primary: true },
  { id: "plan", label: "Plan", icon: ListTodo, primary: true },
  { id: "focus", label: "Focus", icon: Focus, primary: true },
  { id: "constellation", label: "Constellation", icon: Sparkles, primary: true },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "forecast", label: "Forecast", icon: BarChart3 },
  { id: "garden", label: "Mistake Garden", icon: Flower2 },
  { id: "notes", label: "Ghost Notes", icon: Ghost },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "rooms", label: "Quiet Rooms", icon: Users },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "dna", label: "Study DNA", icon: BrainCircuit },
  { id: "wellbeing", label: "Wellbeing", icon: HeartPulse },
  { id: "research", label: "Research Survey", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings },
];

const componentMap: Record<ViewId, React.ComponentType<{ navigate?(view: ViewId): void }>> = {
  weather: WeatherStation,
  plan: PlanView,
  focus: FocusView,
  constellation: ConstellationView,
  tasks: TasksView,
  forecast: ForecastView,
  garden: GardenView,
  notes: NotesView,
  calendar: CalendarView,
  rooms: RoomsView,
  journal: JournalView,
  dna: StudyDNAView,
  wellbeing: WellbeingView,
  research: ResearchSurveyView,
  settings: SettingsView,
};

function viewFromHash(): ViewId {
  if (typeof window === "undefined") return "weather";
  const candidate = window.location.hash.replace("#", "") as ViewId;
  return nav.some((item) => item.id === candidate) ? candidate : "weather";
}

export function AppShell() {
  const { state, celebration, markNotification, markAllNotifications, setFreeze, startSession } = useMindWeather();
  const [view, setView] = useState<ViewId>("weather");
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [bloopMood, setBloopMood] = useState<BloopMood>("neutral");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setView(viewFromHash());
      setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    });
    const onHash = () => setView(viewFromHash());
    const onOnline = () => setOffline(!navigator.onLine);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("hashchange", onHash); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOnline); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setBloopMood("happy"), 1200);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const navigate = useCallback((next: ViewId) => {
    setView(next);
    window.history.replaceState(null, "", `#${next}`);
    setMoreOpen(false);
  }, []);

  const ActiveView = componentMap[view];
  const unread = state.notifications.filter((item) => !item.read).length;
  const weather = WEATHER[state.currentWeather];

  return (
    <main className={`app-shell app-shell--${state.currentWeather} ${collapsed ? "app-shell--collapsed" : ""} ${state.freezeMode ? "app-shell--freeze" : ""} theme--${state.preferences.theme} ${state.preferences.largeText ? "is-large-text" : ""} ${state.preferences.highContrast ? "is-high-contrast" : ""}`}>
      <WeatherBackdrop weather={state.currentWeather} quiet={state.freezeMode} />
      <aside className="app-sidebar panel">
        <div className="app-sidebar__brand"><Brand compact={collapsed} href="/" /><button className="sidebar-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}><PanelLeftClose size={15} /></button></div>
        <nav aria-label="Study areas">
          {nav.filter((item) => !state.freezeMode || ["weather", "focus", "garden"].includes(item.id)).map((item, index) => {
            const Icon = item.icon;
            return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={17} /><span>{item.label}</span>{index === 4 && !state.freezeMode && <i />}</button>;
          })}
        </nav>
        <div className="app-sidebar__weather"><span className="weather-orb" /><div><small>Current weather</small><strong>{weather.short}</strong></div></div>
        <div className="app-sidebar__profile"><span>{state.profile.initials}</span><div><strong>{state.profile.name}</strong><small>Local profile</small></div></div>
      </aside>

      <section className="app-main">
        {offline && <div className="offline-banner"><WifiOff size={14} /><span>You’re offline. Changes are safe on this device and have not synced anywhere.</span></div>}
        <header className="app-topbar">
          <div className="app-topbar__location"><span>{nav.find((item) => item.id === view)?.label}</span><i /> <small>{weather.short} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</small></div>
          <div className="app-topbar__actions">
            <button className={state.freezeMode ? "freeze-toggle active" : "freeze-toggle"} onClick={() => setFreeze(!state.freezeMode)}><MoonStar size={15} /><span>{state.freezeMode ? "Leave quiet mode" : "Freeze mode"}</span></button>
            <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={15} /><span>Search anything</span><kbd>⌘ K</kbd></button>
            <div className="topbar-popover-wrap"><button className="icon-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={`${unread} unread notifications`}><Bell size={17} />{unread > 0 && <i className="notification-dot" />}</button>
              {notificationsOpen && <div className="notification-popover panel"><header><strong>Weather signals</strong><button onClick={markAllNotifications}>Mark all read</button></header>{state.notifications.map((item) => <button key={item.id} className={item.read ? "read" : ""} onClick={() => markNotification(item.id)}><i /><span><strong>{item.title}</strong><small>{item.message}</small></span></button>)}</div>}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={`${view}-${state.freezeMode}`} className="app-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: state.preferences.reduceMotion ? 0 : .22 }}>
            {state.freezeMode && view !== "focus" ? <FreezePanel navigate={navigate} onExit={() => setFreeze(false)} /> : <ActiveView navigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </section>

      <button className="bloop-companion" onClick={() => setBloopMood(bloopMood === "thinking" ? "happy" : "thinking")} aria-label="Check in with Bloop"><Bloop mood={celebration ? "celebrating" : bloopMood} size="md" /><span>{bloopMood === "thinking" ? "What feels sticky?" : "Bloop is nearby"}</span></button>

      <nav className="mobile-nav panel" aria-label="Mobile navigation">
        {nav.filter((item) => item.primary).map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon /><span>{item.label}</span></button>; })}
        <button className={moreOpen ? "active" : ""} onClick={() => setMoreOpen(!moreOpen)}><Grid2X2 /><span>More</span></button>
      </nav>
      {moreOpen && <div className="mobile-more panel"><MoreView navigate={navigate} /></div>}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} navigate={navigate} startSession={() => { startSession(); navigate("focus"); }} setFreeze={() => setFreeze(true)} />
    </main>
  );
}

function FreezePanel({ navigate, onExit }: { navigate(view: ViewId): void; onExit(): void }) {
  const { state, startSession } = useMindWeather();
  const choices = [
    { label: "Revise", icon: TimerReset, task: state.tasks.find((item) => item.type === "Revise" && item.status !== "done") },
    { label: "Practise", icon: Focus, task: state.tasks.find((item) => item.type === "Practise" && item.status !== "done") },
    { label: "Review one mistake", icon: Leaf },
    { label: "Breathe + reset", icon: MoonStar },
  ];
  return <section className="freeze-panel"><div className="freeze-panel__mark"><MoonStar /></div><span>FREEZE MODE</span><h1>What matters for the next<br />20 minutes?</h1><p>The backlog is out of sight. Pick one quiet direction.</p><div className="freeze-choices">{choices.map(({ label, icon: Icon, task }) => <button key={label} onClick={() => { if (label.includes("mistake")) return navigate("garden"); startSession(task?.id, label.includes("reset") ? 3 : 20); navigate("focus"); }}><Icon /><span><strong>{label}</strong><small>{task?.title ?? (label.includes("reset") ? "A deliberate pause" : "One contained action")}</small></span></button>)}</div><button className="button button--ghost" onClick={onExit}>Show the whole station again</button></section>;
}

function CommandPalette({ open, onClose, navigate, startSession, setFreeze }: { open: boolean; onClose(): void; navigate(view: ViewId): void; startSession(): void; setFreeze(): void }) {
  const { state } = useMindWeather();
  const [query, setQuery] = useState("");
  const commands = useMemo(() => [
    { label: "Create Task", detail: "Open task list", icon: CheckCircle2, run: () => navigate("tasks") },
    { label: "Check Brain Weather", detail: "Open Weather Station", icon: CloudSun, run: () => navigate("weather") },
    { label: "Enter Freeze Mode", detail: "Hide the noise", icon: MoonStar, run: setFreeze },
    { label: "Start Study Session", detail: "Use today’s session rhythm", icon: Focus, run: startSession },
    { label: "Teach Bloop", detail: "Explain a concept", icon: BrainCircuit, run: () => navigate("focus") },
    { label: "Open Mistake Garden", detail: "Things that taught me something", icon: Flower2, run: () => navigate("garden") },
    { label: "Open Research Survey", detail: "Study habits and learning support", icon: ClipboardList, run: () => navigate("research") },
    { label: "Download my data", detail: "Settings and privacy", icon: Download, run: () => navigate("settings") },
  ], [navigate, setFreeze, startSession]);
  const results = [...commands.map((item) => ({ ...item, kind: "Command" })), ...state.tasks.map((task) => ({ label: task.title, detail: state.subjects.find((subject) => subject.id === task.subjectId)?.name ?? "Task", icon: CheckCircle2, run: () => navigate("tasks"), kind: "Task" })), ...state.ghostNotes.map((note) => ({ label: note.message, detail: "Ghost note", icon: Ghost, run: () => navigate("notes"), kind: "Note" }))].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
  return <Modal open={open} onClose={onClose} title="Search the weather station" eyebrow="⌘ K"><div className="command-input"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tasks, notes, concepts, commands…" /></div><div className="command-results">{results.length ? results.map((item, index) => <button key={`${item.label}-${index}`} onClick={() => { item.run(); onClose(); }}><item.icon /><span><strong>{item.label}</strong><small>{item.kind} · {item.detail}</small></span><Command size={14} /></button>) : <div className="empty-state"><div><Search /><h3>No signal found</h3><p>Try a subject, concept, or shorter phrase.</p></div></div>}</div></Modal>;
}
