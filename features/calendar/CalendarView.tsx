"use client";

import { useMindWeather } from "@/hooks/useMindWeather";
import { CALENDAR_COLORS, calendarItemColor, defaultCalendarPreferences, type CalendarConnectionStatus, type SyncedCalendarItem } from "@/lib/calendar";
import type { ViewId } from "@/lib/types";
import { googleCalendarService } from "@/services/googleCalendarService";
import { addDays, addWeeks, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from "date-fns";
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, ShieldCheck, Video } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type DisplayItem = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  color: string;
  label: string;
  allDay: boolean;
  webUrl?: string;
  meetUrl?: string;
  duration?: string;
  localTask?: boolean;
};

const emptyStatus: CalendarConnectionStatus = { configured: false, connected: false, backgroundRemindersAvailable: false };

export function CalendarView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state } = useMindWeather();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [connection, setConnection] = useState<CalendarConnectionStatus>(emptyStatus);
  const [externalItems, setExternalItems] = useState<SyncedCalendarItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string>();

  const syncNow = useCallback(async () => {
    setSyncing(true);
    setNotice(undefined);
    try {
      const result = await googleCalendarService.sync(defaultCalendarPreferences());
      setExternalItems(result.items);
      setConnection({ configured: true, connected: true, email: result.email, lastSyncAt: result.syncedAt, backgroundRemindersAvailable: false });
      setNotice(`${result.items.length} Google Calendar item${result.items.length === 1 ? "" : "s"} refreshed.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Calendar sync is unavailable right now.");
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const cache = googleCalendarService.loadCache();
    const frame = window.requestAnimationFrame(() => setExternalItems(cache.items));
    googleCalendarService.status().then((status) => {
      if (!active) return;
      setConnection(status);
      if (status.connected) void syncNow();
    });
    return () => { active = false; window.cancelAnimationFrame(frame); };
  }, [syncNow]);

  const connect = async () => {
    setSyncing(true);
    setNotice(undefined);
    try {
      const status = await googleCalendarService.connect();
      setConnection(status);
      await syncNow();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Google Calendar could not be connected.");
      setSyncing(false);
    }
  };

  const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const displayItems = useMemo<DisplayItem[]>(() => [
    ...state.tasks.filter((task) => task.status !== "done").map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startsAt: task.deadline,
      color: CALENDAR_COLORS.study,
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
      color: calendarItemColor(item),
      label: "Google Calendar",
      allDay: item.allDay,
      webUrl: item.webUrl,
      meetUrl: item.meetUrl,
    })),
  ].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)), [externalItems, state.subjects, state.tasks]);

  const dayItems = displayItems.filter((item) => isSameDay(new Date(item.startsAt), selectedDay));

  return (
    <div className="calendar-page simple-calendar">
      <header className="view-heading view-heading--row simple-calendar__heading">
        <div><span className="view-heading__eyebrow">Calendar</span><h1>Your week, at a glance.</h1><p>Google events and study work in one calm view.</p></div>
        {connection.connected
          ? <button className="button button--ghost" onClick={() => void syncNow()} disabled={syncing}><RefreshCw className={syncing ? "is-spinning" : ""} /> {syncing ? "Refreshing" : "Refresh"}</button>
          : <button className="button button--light" onClick={() => void connect()} disabled={syncing || !connection.configured}><GoogleMark /> {syncing ? "Connecting" : "Connect Google Calendar"}</button>}
      </header>

      <section className={`simple-google-status ${connection.connected ? "is-connected" : ""}`}>
        <span className="simple-google-status__mark"><GoogleMark />{connection.connected && <i><Check /></i>}</span>
        <div>
          <strong>{connection.connected ? `Synced with ${connection.email}` : "Bring your Google schedule into view"}</strong>
          <p>{connection.connected ? "Read-only sync is on and refreshes automatically while this browser session is open. Your Google events are never changed." : connection.configured ? "Choose your own Google account once, then MindWeather refreshes it automatically for this browser session. It only asks to read your calendar." : "Google sync is ready once the site owner adds the public Google client ID."}</p>
        </div>
        {connection.connected && <button onClick={async () => { await googleCalendarService.disconnect(); setConnection({ ...emptyStatus, configured: true }); setExternalItems([]); }}>Disconnect</button>}
      </section>

      {notice && <div className="calendar-notice" role="status"><span>{notice}</span><button onClick={() => setNotice(undefined)} aria-label="Dismiss message">×</button></div>}

      <section className="simple-calendar-card panel">
        <header className="simple-calendar-toolbar">
          <button className="icon-button" onClick={() => setSelectedDay(subWeeks(selectedDay, 1))} aria-label="Previous week"><ChevronLeft /></button>
          <div><strong>{format(weekStart, "MMMM d")} – {format(endOfWeek(selectedDay, { weekStartsOn: 1 }), "MMMM d, yyyy")}</strong><button onClick={() => setSelectedDay(new Date())}>Today</button></div>
          <button className="icon-button" onClick={() => setSelectedDay(addWeeks(selectedDay, 1))} aria-label="Next week"><ChevronRight /></button>
        </header>

        <div className="simple-week" aria-label="Choose a day">
          {weekDays.map((day) => {
            const count = displayItems.filter((item) => isSameDay(new Date(item.startsAt), day)).length;
            return <button key={day.toISOString()} className={`${isSameDay(day, selectedDay) ? "active" : ""} ${isSameDay(day, new Date()) ? "today" : ""}`} onClick={() => setSelectedDay(day)}><small>{format(day, "EEE")}</small><strong>{format(day, "d")}</strong>{count > 0 && <i>{count}</i>}</button>;
          })}
        </div>

        <div className="simple-agenda">
          <header><div><small>{format(selectedDay, "EEEE")}</small><h2>{format(selectedDay, "MMMM d")}</h2></div><span>{dayItems.length} item{dayItems.length === 1 ? "" : "s"}</span></header>
          {dayItems.length ? dayItems.map((item) => <article key={item.id}>
            <time>{item.allDay ? "All day" : format(new Date(item.startsAt), "HH:mm")}</time>
            <i style={{ background: item.color }} />
            <div><small>{item.label}</small><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>
            <div>{item.duration && <span>{item.duration}</span>}{item.meetUrl && <a href={item.meetUrl} target="_blank" rel="noreferrer"><Video /> Join</a>}{item.localTask ? <button onClick={() => navigate("plan")}>Open plan <ArrowRight /></button> : item.webUrl && <a href={item.webUrl} target="_blank" rel="noreferrer">Details <ExternalLink /></a>}</div>
          </article>) : <div className="simple-agenda__empty"><CalendarDays /><h3>Nothing scheduled here.</h3><p>Choose another day or enjoy the space.</p></div>}
        </div>
      </section>

      <p className="simple-calendar-privacy"><ShieldCheck /> Read-only Google access. Calendar events stay under your control. <Link href="/privacy/google-data">How your data is handled</Link></p>
    </div>
  );
}

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.93 3.27-4.77 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.87 0-5.3-1.94-6.17-4.55H2.14v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.83 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.34-2.09V7.07H2.14A11 11 0 0 0 1 12c0 1.77.42 3.44 1.14 4.93l3.69-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.14 7.07l3.69 2.84C6.7 7.31 9.13 5.38 12 5.38Z"/></svg>;
}
