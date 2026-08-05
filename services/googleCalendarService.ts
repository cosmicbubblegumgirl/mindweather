import {
  CALENDAR_CACHE_KEY,
  CALENDAR_DELIVERIES_KEY,
  CALENDAR_PREFERENCES_KEY,
  type CalendarConnectionStatus,
  type CalendarSyncPreferences,
  type CalendarSyncResponse,
  type SyncedCalendarItem,
  defaultCalendarPreferences,
} from "@/lib/calendar";

interface CalendarCache {
  items: SyncedCalendarItem[];
  syncedAt?: string;
  email?: string;
}

async function json<T>(response: Response): Promise<T> {
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Calendar request failed.");
  return payload;
}

export const googleCalendarService = {
  loadCache(): CalendarCache {
    if (typeof window === "undefined") return { items: [] };
    try {
      return JSON.parse(window.localStorage.getItem(CALENDAR_CACHE_KEY) || "{\"items\":[]}") as CalendarCache;
    } catch {
      return { items: [] };
    }
  },

  saveCache(cache: CalendarCache) {
    window.localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(cache));
  },

  clearCache() {
    window.localStorage.removeItem(CALENDAR_CACHE_KEY);
    window.localStorage.removeItem(CALENDAR_DELIVERIES_KEY);
  },

  loadPreferences(): CalendarSyncPreferences {
    const defaults = defaultCalendarPreferences();
    if (typeof window === "undefined") return defaults;
    try {
      return { ...defaults, ...JSON.parse(window.localStorage.getItem(CALENDAR_PREFERENCES_KEY) || "{}") };
    } catch {
      return defaults;
    }
  },

  savePreferences(preferences: CalendarSyncPreferences) {
    window.localStorage.setItem(CALENDAR_PREFERENCES_KEY, JSON.stringify(preferences));
  },

  async status() {
    return json<CalendarConnectionStatus>(await fetch("/api/google/status", { cache: "no-store" }));
  },

  async sync(preferences: CalendarSyncPreferences) {
    const result = await json<CalendarSyncResponse>(await fetch("/api/google/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    }));
    this.saveCache({ items: result.items, syncedAt: result.syncedAt, email: result.email });
    return result;
  },

  async updatePreferences(preferences: CalendarSyncPreferences) {
    this.savePreferences(preferences);
    return json<{ saved: boolean; backgroundRemindersAvailable: boolean }>(await fetch("/api/google/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    }));
  },

  async disconnect() {
    const result = await json<{ disconnected: boolean }>(await fetch("/api/google/disconnect", { method: "DELETE" }));
    this.clearCache();
    return result;
  },
};
