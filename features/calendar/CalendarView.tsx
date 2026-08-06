"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Modal } from "@/components/ui/Modal";
import { useCalendarNotifications } from "@/hooks/useCalendarNotifications";
import { useMindWeather } from "@/hooks/useMindWeather";
import {
  CALENDAR_COLORS,
  calendarItemColor,
  defaultCalendarPreferences,
  type CalendarConnectionStatus,
  type CalendarSyncPreferences,
  type SyncedCalendarItem,
} from "@/lib/calendar";
import type { StudyTask, ViewId } from "@/lib/types";
import { googleCalendarService } from "@/services/googleCalendarService";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  ExternalLink,
  GraduationCap,
  Mail,
  MoveRight,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Video,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CalendarViewMode = "day" | "week" | "month";
type DisplayItem = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  kind: "meeting" | "calendar" | "assignment" | "study";
  color: string;
  label: string;
  allDay: boolean;
  webUrl?: string;
  meetUrl?: string;
  duration?: string;
  localTask?: boolean;
};

const emptyStatus: CalendarConnectionStatus = { configured: true, connected: false, backgroundRemindersAvailable: false };

export function CalendarView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, updateTask } = useMindWeather();
  const [view, setView] = useState<CalendarViewMode>("month");
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [reschedule, setReschedule] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connection, setConnection] = useState<CalendarConnectionStatus>(emptyStatus);
  const [externalItems, setExternalItems] = useState<SyncedCalendarItem[]>([]);
  const [syncedAt, setSyncedAt] = useState<string>();
  const [preferences, setPreferences] = useState<CalendarSyncPreferences>(defaultCalendarPreferences());
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const syncNow = useCallback(async (prefs: CalendarSyncPreferences, quiet = false) => {
    setSyncing(true);
    setError(undefined);
    try {
      const result = await googleCalendarService.sync(prefs);
      setExternalItems(result.items);
      setSyncedAt(result.syncedAt);
      setConnection((current) => ({ ...current, connected: true, email: result.email, lastSyncAt: result.syncedAt, backgroundRemindersAvailable: result.backgroundRemindersAvailable }));
      if (!quiet) setNotice(result.warnings[0] || `Calendar refreshed · ${result.items.length} items found`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Calendar sync failed.");
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const cache = googleCalendarService.loadCache();
    const savedPreferences = googleCalendarService.loadPreferences();
    const frame = window.requestAnimationFrame(() => {
      if (!active) return;
      setExternalItems(cache.items);
      setSyncedAt(cache.syncedAt);
      setPreferences(savedPreferences);
    });
    googleCalendarService.status()
      .then((status) => {
        if (!active) return;
        setConnection(status);
        if (status.connected) void syncNow(savedPreferences, true);
      })
      .catch(() => active && setConnection({ configured: false, connected: false, backgroundRemindersAvailable: false, reason: "Calendar connection status is unavailable." }))
      .finally(() => active && setLoadingStatus(false));
    return () => { active = false; window.cancelAnimationFrame(frame); };
  }, [syncNow]);

  useCalendarNotifications(externalItems, preferences);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const list: Date[] = [];
    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) list.push(cursor);
    return list;
  }, [month]);

  const displayItems = useMemo<DisplayItem[]>(() => [
    ...state.tasks.filter((task) => task.status !== "done").map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startsAt: task.deadline,
      kind: "study" as const,
      color: state.subjects.find((subject) => subject.id === task.subjectId)?.color || CALENDAR_COLORS.study,
      label: state.subjects.find((subject) => subject.id === task.subjectId)?.name || "Study task",
      allDay: false,
      duration: `${task.estimatedMinutes} min`,
      localTask: true,
    })),
    ...externalItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      kind: item.kind,
      color: calendarItemColor(item),
      label: item.kind === "assignment" ? item.courseName || "Google Classroom" : item.kind === "meeting" ? "Google Meet" : "Google Calendar",
      allDay: item.allDay,
      webUrl: item.webUrl,
      meetUrl: item.meetUrl,
    })),
  ].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)), [externalItems, state.subjects, state.tasks]);

  const agendaItems = useMemo(() => displayItems.filter((item) => {
    const date = new Date(item.startsAt);
    if (view === "day") return isSameDay(date, selectedDay);
    return date >= startOfWeek(selectedDay, { weekStartsOn: 1 }) && date <= endOfWeek(selectedDay, { weekStartsOn: 1 });
  }), [displayItems, selectedDay, view]);

  const moveCandidates = state.tasks.filter((task) => task.status !== "done" && task.energy >= 3 && !task.id.startsWith("classroom-")).slice(0, 3);
  const move = () => {
    moveCandidates.forEach((task) => updateTask(task.id, { deadline: addDays(new Date(task.deadline), 1).toISOString() }));
    setReschedule(false);
  };

  const updatePreferences = async (changes: Partial<CalendarSyncPreferences>) => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    googleCalendarService.savePreferences(next);
    if (connection.connected) {
      try {
        const result = await googleCalendarService.updatePreferences(next);
        setConnection((current) => ({ ...current, backgroundRemindersAvailable: result.backgroundRemindersAvailable }));
      } catch {
        setError("Those reminder settings were saved on this device, but the background service could not be updated.");
      }
    }
  };

  const enableBrowserNotifications = async () => {
    if (typeof Notification === "undefined") return setError("This browser does not support desktop notifications.");
    const permission = await Notification.requestPermission();
    await updatePreferences({ browserNotifications: permission === "granted" });
    setNotice(permission === "granted" ? "Browser reminders are on for this device." : "Browser notification permission was not granted.");
  };

  const disconnect = async () => {
    try {
      await googleCalendarService.disconnect();
      setConnection({ ...emptyStatus, configured: connection.configured });
      setExternalItems([]);
      setSyncedAt(undefined);
      setSettingsOpen(false);
      setNotice("Google access was revoked and synced calendar data was removed from this device.");
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "The account could not be disconnected.");
    }
  };

  const connectUrl = `/api/google/connect?returnTo=${encodeURIComponent("/station#calendar")}&timezone=${encodeURIComponent(preferences.timezone)}`;

  return <div className="calendar-page">
    <header className="view-heading view-heading--row">
      <div><span className="view-heading__eyebrow">Weather calendar</span><h1>Everything due, without the scramble.</h1><p>Meetings, Meet links, Classroom deadlines and your study plan share one calm horizon.</p></div>
      <button className="button button--ghost" onClick={() => setReschedule(true)}><WandSparkles /> Reshape today</button>
    </header>

    <GoogleConnectionPanel
      status={connection}
      loading={loadingStatus}
      syncing={syncing}
      syncedAt={syncedAt}
      itemCount={externalItems.length}
      onConnect={() => setConsentOpen(true)}
      onSync={() => void syncNow(preferences)}
      onSettings={() => setSettingsOpen(true)}
    />

    {(notice || error) && <div className={`calendar-notice ${error ? "calendar-notice--error" : ""}`} role="status"><span>{error || notice}</span><button onClick={() => { setNotice(undefined); setError(undefined); }} aria-label="Dismiss message">×</button></div>}

    <div className="calendar-legend" aria-label="Calendar colour key">
      <span><i style={{ background: CALENDAR_COLORS.meeting }} />Meetings</span>
      <span><i style={{ background: CALENDAR_COLORS.assignment }} />Assignment deadlines</span>
      <span><i style={{ background: CALENDAR_COLORS.calendar }} />Calendar events</span>
      <span><i style={{ background: CALENDAR_COLORS.study }} />MindWeather study work</span>
    </div>

    <section className="calendar-shell panel">
      <header className="calendar-toolbar">
        <div>
          <button className="icon-button" onClick={() => { setMonth(subMonths(month, 1)); setSelectedDay(subMonths(selectedDay, 1)); }} aria-label="Previous month"><ChevronLeft /></button>
          <h2>{format(month, "MMMM yyyy")}</h2>
          <button className="icon-button" onClick={() => { setMonth(addMonths(month, 1)); setSelectedDay(addMonths(selectedDay, 1)); }} aria-label="Next month"><ChevronRight /></button>
          <button className="calendar-today" onClick={() => { setMonth(new Date()); setSelectedDay(new Date()); }}>Today</button>
        </div>
        <div className="segmented"><button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Day</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button><button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Month</button></div>
      </header>
      {view === "month"
        ? <MonthView days={days} month={month} items={displayItems} onDay={(day) => { setSelectedDay(day); setView("day"); }} onItem={(item) => item.localTask ? navigate("tasks") : item.webUrl && window.open(item.webUrl, "_blank", "noopener,noreferrer")} />
        : <AgendaView items={agendaItems} selectedDay={selectedDay} view={view} onLocalTask={() => navigate("tasks")} />}
    </section>

    <div className="calendar-safeguard">
      <ShieldCheck /><div><strong>Read-only by design</strong><p>MindWeather never edits Google events, turns in coursework, or reads Gmail messages. Disconnecting revokes access and removes the stored connection.</p></div><a href="/privacy/google-data">Google data & privacy <ArrowRight /></a>
    </div>

    <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title="Bring your Google schedule into view" eyebrow="Before you connect" size="lg">
      <div className="calendar-consent">
        <div className="calendar-consent__intro"><GoogleMark /><div><strong>You stay in control.</strong><p>This is a read-only connection. Google will show the exact permissions before anything is shared.</p></div></div>
        <div className="calendar-consent__columns">
          <section><span>MINDEWEATHER WILL READ</span><ConsentLine>Event names, times, locations and Meet links</ConsentLine><ConsentLine>Active Classroom courses and published due dates</ConsentLine><ConsentLine>Your Google email, for summaries you enable</ConsentLine></section>
          <section><span>MINDEWEATHER WILL NOT</span><ConsentLine negative>Edit or delete calendar events</ConsentLine><ConsentLine negative>Read messages in Gmail</ConsentLine><ConsentLine negative>Submit, grade or change coursework</ConsentLine></section>
        </div>
        <p className="calendar-consent__fine">By continuing, you authorise this specific use of Google data. You can disconnect at any time. Read the <a href="/privacy/google-data" target="_blank">Google data notice</a>.</p>
        <div className="calendar-consent__actions"><button className="button button--ghost" onClick={() => setConsentOpen(false)}>Not now</button>{connection.configured ? <a className="button button--light" href={connectUrl}><GoogleMark /> Continue with Google</a> : <button className="button button--light" disabled>Server setup required</button>}</div>
      </div>
    </Modal>

    <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Calendar signals" eyebrow="Reminders & delivery" size="lg">
      <CalendarSettings preferences={preferences} status={connection} onChange={updatePreferences} onEnableBrowser={enableBrowserNotifications} onDisconnect={disconnect} />
    </Modal>

    <Modal open={reschedule} onClose={() => setReschedule(false)} title="Today became a Low Battery day." eyebrow="A suggested reshuffle" size="lg"><div className="reschedule"><p>These are high-energy study blocks. MindWeather can move them one day without touching imported meetings or major deadlines.</p><div className="reschedule-columns"><section><span>BEFORE</span>{moveCandidates.map((task) => <RescheduleItem task={task} key={task.id} />)}</section><MoveRight /><section><span>AFTER</span>{moveCandidates.map((task) => <RescheduleItem task={{ ...task, deadline: addDays(new Date(task.deadline), 1).toISOString() }} key={task.id} />)}</section></div><div className="reschedule-note"><CloudRain /><span><strong>Nothing moves until you save.</strong><small>Google events and Classroom deadlines always stay exactly where they are.</small></span></div><div className="reschedule-actions"><button className="button button--ghost" onClick={() => setReschedule(false)}>Keep the original plan</button><button className="button button--peach" onClick={move} disabled={!moveCandidates.length}>Save the lighter plan <ArrowRight /></button></div></div></Modal>
  </div>;
}

function GoogleConnectionPanel({ status, loading, syncing, syncedAt, itemCount, onConnect, onSync, onSettings }: { status: CalendarConnectionStatus; loading: boolean; syncing: boolean; syncedAt?: string; itemCount: number; onConnect(): void; onSync(): void; onSettings(): void }) {
  return <section className={`google-calendar-panel ${status.connected ? "is-connected" : ""}`}>
    <div className="google-calendar-panel__mark"><GoogleMark />{status.connected && <i><Check /></i>}</div>
    <div className="google-calendar-panel__copy">
      <span>{loading ? "CHECKING CONNECTION" : status.connected ? "GOOGLE SCHEDULE CONNECTED" : "ONE CALENDAR, LESS CHASING"}</span>
      <h2>{status.connected ? status.email : "Add Calendar, Meet and Classroom"}</h2>
      <p>{status.connected ? `${itemCount} upcoming items · ${syncedAt ? `refreshed ${formatDistanceToNow(new Date(syncedAt), { addSuffix: true })}` : "ready to refresh"}` : status.reason || "See Meet links beside meetings, deadlines beside study blocks, and receive reminders before the rush."}</p>
    </div>
    {status.connected ? <div className="google-calendar-panel__actions"><button className="button button--ghost button--small" onClick={onSync} disabled={syncing}><RefreshCw className={syncing ? "is-spinning" : ""} />{syncing ? "Syncing" : "Sync now"}</button><button className="icon-button" onClick={onSettings} aria-label="Calendar settings"><Settings2 /></button></div> : <button className="button button--light" onClick={onConnect} disabled={loading}><GoogleMark /> Connect Google</button>}
    <div className="google-calendar-panel__bloop"><Bloop mood={status.connected ? "happy" : "thinking"} size="md" /></div>
  </section>;
}

function MonthView({ days, month, items, onDay, onItem }: { days: Date[]; month: Date; items: DisplayItem[]; onDay(day: Date): void; onItem(item: DisplayItem): void }) {
  return <div className="month-calendar"><div className="weekday-row">{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => <span key={day}>{day}</span>)}</div><div className="month-grid">{days.map((day) => {
    const dayItems = items.filter((item) => isSameDay(new Date(item.startsAt), day));
    return <article key={day.toISOString()} className={`${!isSameMonth(day, month) ? "muted" : ""} ${isSameDay(day, new Date()) ? "today" : ""}`}>
      <header><button onClick={() => onDay(day)} aria-label={`Open ${format(day, "MMMM d")}`}>{format(day, "d")}</button>{isSameDay(day, new Date()) && <em>TODAY</em>}</header>
      {dayItems.slice(0, 4).map((item) => <button className="month-event" key={item.id} onClick={() => onItem(item)} style={{ "--event": item.color } as React.CSSProperties}><i /><span>{item.title}</span><small>{item.allDay ? "ALL DAY" : format(new Date(item.startsAt), "HH:mm")}</small></button>)}
      {dayItems.length > 4 && <small>+{dayItems.length - 4} more</small>}
    </article>;
  })}</div></div>;
}

function AgendaView({ items, selectedDay, view, onLocalTask }: { items: DisplayItem[]; selectedDay: Date; view: Exclude<CalendarViewMode, "month">; onLocalTask(): void }) {
  return <div className="agenda-wrap"><header className="agenda-header"><div><span>{view === "day" ? format(selectedDay, "EEEE") : "This week"}</span><h3>{view === "day" ? format(selectedDay, "MMMM d, yyyy") : `${format(startOfWeek(selectedDay, { weekStartsOn: 1 }), "MMM d")} – ${format(endOfWeek(selectedDay, { weekStartsOn: 1 }), "MMM d")}`}</h3></div><small>{items.length} scheduled item{items.length === 1 ? "" : "s"}</small></header><div className="agenda-view">{items.length ? items.map((item) => <article key={item.id}>
    <time>{format(new Date(item.startsAt), view === "day" ? "HH:mm" : "EEE\nHH:mm")}</time><i style={{ background: item.color }} />
    <div><small>{item.label}</small><h3>{item.title}</h3><p>{item.description || (item.kind === "meeting" ? "Meeting details from Google Calendar" : item.kind === "assignment" ? "Published deadline from Google Classroom" : "Scheduled calendar event")}</p></div>
    <div className="agenda-view__actions">{item.duration && <span>{item.duration}</span>}{item.meetUrl && <a href={item.meetUrl} target="_blank" rel="noreferrer" className="join-meet"><Video /> Join Meet</a>}{item.localTask ? <button onClick={onLocalTask}>Open task <ArrowRight /></button> : item.webUrl && <a href={item.webUrl} target="_blank" rel="noreferrer">Details <ExternalLink /></a>}</div>
  </article>) : <div className="empty-state"><div><CalendarDays /><h3>The horizon is clear</h3><p>No meetings, deadlines or study events in this view.</p></div></div>}</div></div>;
}

function CalendarSettings({ preferences, status, onChange, onEnableBrowser, onDisconnect }: { preferences: CalendarSyncPreferences; status: CalendarConnectionStatus; onChange(changes: Partial<CalendarSyncPreferences>): void; onEnableBrowser(): void; onDisconnect(): void }) {
  const notificationPermission = typeof Notification === "undefined" ? "unsupported" : Notification.permission;
  return <div className="calendar-settings">
    <section className="calendar-settings__status"><div><Mail /><span><strong>Daily weather window</strong><small>{status.backgroundRemindersAvailable ? `Delivered to ${status.email}` : "Hosted scheduler setup is still needed"}</small></span></div><Toggle checked={preferences.emailDigest} onChange={(checked) => onChange({ emailDigest: checked })} label="Email digest" /></section>
    <label className="calendar-time"><span>Send the daily summary at</span><select value={preferences.digestHour} onChange={(event) => onChange({ digestHour: Number(event.target.value) })}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}</select><small>{preferences.timezone}</small></label>
    <div className="calendar-settings__grid">
      <section><Video /><div><strong>Meeting signal</strong><p>Email and browser alert 15 minutes before Google Meet events.</p></div><Toggle checked={preferences.meetingReminders} onChange={(checked) => onChange({ meetingReminders: checked })} label="Meeting reminders" /></section>
      <section><GraduationCap /><div><strong>Deadline signal</strong><p>Email and browser alert three days before Classroom work is due.</p></div><Toggle checked={preferences.deadlineReminders} onChange={(checked) => onChange({ deadlineReminders: checked })} label="Deadline reminders" /></section>
    </div>
    <section className="browser-reminder"><BellRing /><div><strong>Browser notifications</strong><p>These appear on this device while MindWeather is open. Email reminders continue in the background.</p></div>{notificationPermission === "granted" && preferences.browserNotifications ? <span className="calendar-on"><Check /> On</span> : <button className="button button--ghost button--small" onClick={onEnableBrowser}>Enable</button>}</section>
    <div className="calendar-settings__privacy"><ShieldCheck /><p>Read-only access. Tokens are encrypted at rest and never sent to the browser in readable form. Delivery records are kept only to prevent duplicates.</p><a href="/privacy/google-data" target="_blank">View data notice <ExternalLink /></a></div>
    <div className="calendar-settings__footer"><span>Connected as {status.email}</span><button onClick={onDisconnect}>Disconnect and delete synced data</button></div>
  </div>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange(value: boolean): void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`calendar-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}><i /></button>;
}

function ConsentLine({ children, negative = false }: { children: React.ReactNode; negative?: boolean }) {
  return <div className={negative ? "is-negative" : ""}>{negative ? <span>×</span> : <Check />}<p>{children}</p></div>;
}

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.93 3.27-4.77 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.87 0-5.3-1.94-6.17-4.55H2.14v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.83 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.34-2.09V7.07H2.14A11 11 0 0 0 1 12c0 1.77.42 3.44 1.14 4.93l3.69-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.14 7.07l3.69 2.84C6.7 7.31 9.13 5.38 12 5.38Z"/></svg>;
}

function RescheduleItem({ task }: { task: StudyTask }) { return <article><div><strong>{task.title}</strong><small>{format(new Date(task.deadline), "EEE, MMM d · HH:mm")}</small></div><span>{task.estimatedMinutes}m</span></article>; }
