"use client";

import {
  CALENDAR_DELIVERIES_KEY,
  isDeadlineReminderDue,
  isMeetingReminderDue,
  type CalendarSyncPreferences,
  type SyncedCalendarItem,
} from "@/lib/calendar";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

function deliveredKeys(): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(CALENDAR_DELIVERIES_KEY) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

function remember(keys: Set<string>) {
  window.localStorage.setItem(CALENDAR_DELIVERIES_KEY, JSON.stringify([...keys].slice(-300)));
}

export function useCalendarNotifications(items: SyncedCalendarItem[], preferences: CalendarSyncPreferences) {
  useEffect(() => {
    if (!preferences.browserNotifications || typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const check = () => {
      const delivered = deliveredKeys();
      for (const item of items) {
        const meetingDue = preferences.meetingReminders && isMeetingReminderDue(item);
        const deadlineDue = preferences.deadlineReminders && isDeadlineReminderDue(item);
        if (!meetingDue && !deadlineDue) continue;
        const key = `${meetingDue ? "meeting" : "deadline"}:${item.id}:${item.startsAt}`;
        if (delivered.has(key)) continue;

        const notification = new Notification(meetingDue ? `Meeting in 15 minutes · ${item.title}` : `Due in 3 days · ${item.title}`, {
          body: meetingDue
            ? [item.location, item.meetUrl ? "Google Meet link is ready" : "Open the calendar for details"].filter(Boolean).join(" · ")
            : `${item.courseName || "Google Classroom"} · ${formatDistanceToNow(new Date(item.startsAt), { addSuffix: true })}`,
          icon: "/app-icon.svg",
          tag: key,
        });
        notification.onclick = () => { window.focus(); if (item.webUrl) window.open(item.webUrl, "_blank", "noopener,noreferrer"); };
        delivered.add(key);
      }
      remember(delivered);
    };

    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [items, preferences]);
}
