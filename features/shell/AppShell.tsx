"use client";

import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { CalendarView } from "@/features/calendar/CalendarView";
import { ConstellationView } from "@/features/constellation/ConstellationView";
import { FocusView } from "@/features/focus/FocusView";
import { ForecastView } from "@/features/forecast/ForecastView";
import { GardenView } from "@/features/garden/GardenView";
import { JournalView } from "@/features/journal/JournalView";
import { MobileInstallView } from "@/features/mobile/MobileInstallView";
import { MoreView } from "@/features/more/MoreView";
import { NotebookView } from "@/features/notebook/NotebookView";
import { NotesView } from "@/features/notes/NotesView";
import { PlanView } from "@/features/plan/PlanView";
import { ResearchSurveyView } from "@/features/research/ResearchSurveyView";
import { RoomsView } from "@/features/rooms/RoomsView";
import { SettingsView } from "@/features/settings/SettingsView";
import { StudyDNAView } from "@/features/study-dna/StudyDNAView";
import { TasksView } from "@/features/tasks/TasksView";
import { WeatherStation } from "@/features/weather/WeatherStation";
import { WellbeingView } from "@/features/wellbeing/WellbeingView";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
import { authService } from "@/services/authService";
import { CalendarDays, CloudSun, Focus, Grid2X2, ListTodo, Settings, ShieldCheck, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const primaryNav = [
  { id: "weather" as const, label: "Today", icon: CloudSun },
  { id: "plan" as const, label: "Plan", icon: ListTodo },
  { id: "focus" as const, label: "Focus", icon: Focus },
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { id: "more" as const, label: "Explore", icon: Grid2X2 },
];

const viewLabels: Record<ViewId, string> = {
  weather: "Today",
  plan: "Plan",
  focus: "Focus",
  calendar: "Calendar",
  tasks: "Tasks",
  forecast: "Forecast",
  garden: "Mistake Garden",
  notes: "Notes",
  notebook: "Quirky Notebook",
  constellation: "Constellation",
  rooms: "Quiet Rooms",
  journal: "Journal",
  dna: "Study patterns",
  wellbeing: "Rescue tools",
  research: "Research Survey",
  mobile: "Mobile App",
  more: "Explore",
  settings: "Settings",
};

const componentMap: Record<ViewId, React.ComponentType<{ navigate?(view: ViewId): void }>> = {
  weather: WeatherStation,
  plan: PlanView,
  focus: FocusView,
  calendar: CalendarView,
  tasks: TasksView,
  forecast: ForecastView,
  garden: GardenView,
  notes: NotesView,
  notebook: NotebookView,
  constellation: ConstellationView,
  rooms: RoomsView,
  journal: JournalView,
  dna: StudyDNAView,
  wellbeing: WellbeingView,
  research: ResearchSurveyView,
  mobile: MobileInstallView,
  more: MoreView,
  settings: SettingsView,
};

function viewFromHash(): ViewId {
  if (typeof window === "undefined") return "weather";
  const candidate = window.location.hash.replace("#", "") as ViewId;
  return candidate in componentMap ? candidate : "weather";
}

export function AppShell() {
  const router = useRouter();
  const { state } = useMindWeather();
  const [view, setView] = useState<ViewId>("weather");
  const [offline, setOffline] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    void authService.current().then((account) => {
      if (!active) return;
      if (!account) {
        router.replace("/login");
        return;
      }
      setAuthorized(true);
    });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const frame = window.requestAnimationFrame(() => {
      setView(viewFromHash());
      setOffline(!navigator.onLine);
    });
    const onHash = () => setView(viewFromHash());
    const onConnectionChange = () => setOffline(!navigator.onLine);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("online", onConnectionChange);
    window.addEventListener("offline", onConnectionChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("online", onConnectionChange);
      window.removeEventListener("offline", onConnectionChange);
    };
  }, [authorized]);

  const navigate = useCallback((next: ViewId) => {
    setView(next);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: state.preferences.reduceMotion ? "auto" : "smooth" });
  }, [state.preferences.reduceMotion]);

  const ActiveView = componentMap[view];
  const weather = WEATHER[state.currentWeather];

  if (!authorized) {
    return <main className="station-gate"><WeatherBackdrop weather="breezy" quiet /><Brand href="/" /><section className="panel"><ShieldCheck /><small>ACCOUNT REQUIRED</small><h1>Checking your secure session.</h1><p>Your weather station stays hidden until Supabase confirms your MindWeather account.</p></section></main>;
  }

  return (
    <main className={`app-shell simple-shell app-shell--${state.currentWeather} theme--${state.preferences.theme} reading--${state.preferences.readingMode} ${state.preferences.largeText ? "is-large-text" : ""} ${state.preferences.highContrast ? "is-high-contrast" : ""}`}>
      <WeatherBackdrop weather={state.currentWeather} quiet />

      <aside className="app-sidebar simple-sidebar panel">
        <Brand href="/" />
        <nav aria-label="Main navigation">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="simple-sidebar__footer">
          <div className="app-sidebar__weather">
            <span className="weather-orb" />
            <div><small>Today feels</small><strong>{weather.short}</strong></div>
          </div>
          <button className={view === "settings" ? "simple-settings-link active" : "simple-settings-link"} onClick={() => navigate("settings")}>
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <section className="app-main simple-main">
        {offline && <div className="offline-banner"><WifiOff size={14} /><span>You&apos;re offline. Changes stay safely on this device and sync when you reconnect.</span></div>}
        <header className="app-topbar simple-topbar">
          <div>
            <span>{viewLabels[view]}</span>
            <small>{weather.short} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</small>
          </div>
          <button className="simple-profile" onClick={() => navigate("settings")} aria-label="Open settings">
            <span>{state.profile.initials}</span>
            <strong>{state.profile.name}</strong>
          </button>
        </header>

        <div className="app-view simple-view" key={view}>
          <ActiveView navigate={navigate} />
        </div>
        <footer className="product-footer"><span>Made by <strong>Quantum Cupcake</strong></span><small>Designed for real learners on changing days.</small></footer>
      </section>

      <nav className="mobile-nav simple-mobile-nav panel" aria-label="Main navigation">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><Icon /><span>{item.label}</span></button>;
        })}
      </nav>
    </main>
  );
}
