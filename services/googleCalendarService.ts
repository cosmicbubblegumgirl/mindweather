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

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(options: {
            client_id: string;
            scope: string;
            callback(response: GoogleTokenResponse): void;
            error_callback?(error: { type?: string }): void;
          }): GoogleTokenClient;
          revoke(token: string, callback?: () => void): void;
        };
      };
    };
  }
}

const TOKEN_KEY = "mindweather.google-access.v1";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_SCOPE = "openid email https://www.googleapis.com/auth/calendar.readonly";

function storedToken() {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.sessionStorage.getItem(TOKEN_KEY) || "null") as { token: string; expiresAt: number } | null;
    return value && value.expiresAt > Date.now() + 30_000 ? value.token : null;
  } catch {
    return null;
  }
}

function loadGoogleIdentity() {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-mindweather-google]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.mindweatherGoogle = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(script);
  });
}

async function googleJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const payload = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || "Google Calendar could not be refreshed.");
  return payload;
}

function eventDate(value?: { dateTime?: string; date?: string }) {
  if (value?.dateTime) return value.dateTime;
  return value?.date ? `${value.date}T00:00:00` : new Date().toISOString();
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

  async status(): Promise<CalendarConnectionStatus> {
    const cache = this.loadCache();
    let googleSignInReady = Boolean(GOOGLE_CLIENT_ID);
    if (GOOGLE_CLIENT_ID) {
      try {
        await loadGoogleIdentity();
      } catch {
        googleSignInReady = false;
      }
    }
    return {
      configured: googleSignInReady,
      connected: Boolean(storedToken()),
      backgroundRemindersAvailable: false,
      email: cache.email,
      lastSyncAt: cache.syncedAt,
      reason: !GOOGLE_CLIENT_ID
        ? "Google Calendar needs a public browser client ID."
        : googleSignInReady
          ? undefined
          : "Google sign-in could not be loaded.",
    };
  },

  async connect(): Promise<CalendarConnectionStatus> {
    if (!GOOGLE_CLIENT_ID) throw new Error("Google Calendar is not configured for this site yet.");
    await loadGoogleIdentity();
    return new Promise((resolve, reject) => {
      const client = window.google?.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPE,
        callback: (response) => {
          if (!response.access_token) {
            reject(new Error(response.error_description || "Google connection was cancelled."));
            return;
          }
          window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token: response.access_token, expiresAt: Date.now() + (response.expires_in || 3600) * 1000 }));
          resolve({ configured: true, connected: true, backgroundRemindersAvailable: false });
        },
        error_callback: () => reject(new Error("Google connection was cancelled.")),
      });
      client?.requestAccessToken({ prompt: "consent" });
    });
  },

  async sync(preferences: CalendarSyncPreferences): Promise<CalendarSyncResponse> {
    this.savePreferences(preferences);
    const token = storedToken();
    if (!token) throw new Error("Connect Google Calendar to refresh your schedule.");
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 14);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 90);
    const query = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "150",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
    });
    const [calendar, profile] = await Promise.all([
      googleJson<{ items?: GoogleCalendarEvent[] }>(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, token),
      googleJson<{ email?: string }>("https://www.googleapis.com/oauth2/v3/userinfo", token),
    ]);
    const items: SyncedCalendarItem[] = (calendar.items || []).filter((event) => event.start).map((event) => ({
      id: `google-${event.id}`,
      externalId: event.id,
      title: event.summary || "Untitled event",
      description: event.description || "",
      kind: event.hangoutLink || event.conferenceData?.entryPoints?.some((point) => point.entryPointType === "video") ? "meeting" : "calendar",
      source: "google-calendar",
      startsAt: eventDate(event.start),
      endsAt: event.end ? eventDate(event.end) : undefined,
      allDay: Boolean(event.start?.date && !event.start.dateTime),
      location: event.location,
      webUrl: event.htmlLink,
      meetUrl: event.hangoutLink || event.conferenceData?.entryPoints?.find((point) => point.entryPointType === "video")?.uri,
    }));
    const syncedAt = new Date().toISOString();
    const email = profile.email || this.loadCache().email || "Google account";
    const result = { items, syncedAt, email, backgroundRemindersAvailable: false, warnings: [] };
    this.saveCache({ items, syncedAt, email });
    return result;
  },

  async updatePreferences(preferences: CalendarSyncPreferences) {
    this.savePreferences(preferences);
    return { saved: true, backgroundRemindersAvailable: false };
  },

  async disconnect() {
    const token = storedToken();
    if (token) {
      try {
        await loadGoogleIdentity();
        window.google?.accounts.oauth2.revoke(token);
      } catch {
        // Local cleanup still completes if Google's script is unavailable.
      }
    }
    window.sessionStorage.removeItem(TOKEN_KEY);
    this.clearCache();
    return { disconnected: true };
  },
};
