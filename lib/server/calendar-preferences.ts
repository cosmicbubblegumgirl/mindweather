import { defaultCalendarPreferences, type CalendarSyncPreferences } from "@/lib/calendar";

function validTimezone(value: unknown) {
  if (typeof value !== "string" || value.length > 80) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return value;
  } catch {
    return "UTC";
  }
}

export function calendarPreferences(value: unknown): CalendarSyncPreferences {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const defaults = defaultCalendarPreferences();
  const digestHour = typeof input.digestHour === "number" && Number.isInteger(input.digestHour)
    ? Math.max(0, Math.min(23, input.digestHour))
    : defaults.digestHour;
  return {
    browserNotifications: input.browserNotifications === true,
    emailDigest: input.emailDigest !== false,
    meetingReminders: input.meetingReminders !== false,
    deadlineReminders: input.deadlineReminders !== false,
    digestHour,
    timezone: validTimezone(input.timezone || defaults.timezone),
  };
}

export function safeTimezone(value: unknown) {
  return validTimezone(value);
}
