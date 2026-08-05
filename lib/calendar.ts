export type CalendarItemKind = "meeting" | "calendar" | "assignment";
export type CalendarItemSource = "google-calendar" | "google-classroom";

export interface SyncedCalendarItem {
  id: string;
  externalId: string;
  title: string;
  description: string;
  kind: CalendarItemKind;
  source: CalendarItemSource;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  courseName?: string;
  location?: string;
  webUrl?: string;
  meetUrl?: string;
}

export interface CalendarConnectionStatus {
  configured: boolean;
  connected: boolean;
  backgroundRemindersAvailable: boolean;
  email?: string;
  lastSyncAt?: string;
  scopes?: string[];
  reason?: string;
}

export interface CalendarSyncPreferences {
  browserNotifications: boolean;
  emailDigest: boolean;
  meetingReminders: boolean;
  deadlineReminders: boolean;
  digestHour: number;
  timezone: string;
}

export interface CalendarSyncResponse {
  items: SyncedCalendarItem[];
  syncedAt: string;
  email: string;
  backgroundRemindersAvailable: boolean;
  warnings: string[];
}

export const CALENDAR_COLORS: Record<CalendarItemKind | "study", string> = {
  meeting: "#a997ff",
  calendar: "#8fe7dd",
  assignment: "#ffb58b",
  study: "#fff0b9",
};

export const CALENDAR_CACHE_KEY = "mindweather.google-calendar.v1";
export const CALENDAR_PREFERENCES_KEY = "mindweather.calendar-preferences.v1";
export const CALENDAR_DELIVERIES_KEY = "mindweather.calendar-deliveries.v1";

export function defaultCalendarPreferences(): CalendarSyncPreferences {
  return {
    browserNotifications: false,
    emailDigest: true,
    meetingReminders: true,
    deadlineReminders: true,
    digestHour: 7,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

export function calendarItemColor(item: Pick<SyncedCalendarItem, "kind">) {
  return CALENDAR_COLORS[item.kind];
}

export function isMeetingReminderDue(item: SyncedCalendarItem, now = new Date()) {
  if (item.kind !== "meeting") return false;
  const minutes = (+new Date(item.startsAt) - +now) / 60_000;
  return minutes > 0 && minutes <= 15;
}

export function isDeadlineReminderDue(item: SyncedCalendarItem, now = new Date()) {
  if (item.kind !== "assignment") return false;
  const hours = (+new Date(item.startsAt) - +now) / 3_600_000;
  return hours > 0 && hours <= 72;
}
