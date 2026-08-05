import type { SyncedCalendarItem } from "@/lib/calendar";
import { GOOGLE_SCOPES, googleConfig } from "@/lib/server/calendar-config";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
}

interface GoogleUserInfo {
  email: string;
  email_verified?: boolean;
  name?: string;
}

async function googleJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Google API request failed (${response.status}): ${detail}`);
  }
  return response.json() as Promise<T>;
}

export function googleAuthorizationUrl(requestUrl: string, state: string, challenge: string) {
  const config = googleConfig(requestUrl);
  if (!config.configured || !config.clientId || !config.redirectUri) throw new Error("Google Calendar sync is not configured.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeGoogleCode(requestUrl: string, code: string, verifier: string) {
  const config = googleConfig(requestUrl);
  if (!config.configured || !config.clientId || !config.clientSecret || !config.redirectUri) throw new Error("Google Calendar sync is not configured.");
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });
  return googleJson<GoogleTokenResponse>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function refreshGoogleAccessToken(requestUrl: string, refreshToken: string) {
  const config = googleConfig(requestUrl);
  if (!config.configured || !config.clientId || !config.clientSecret) throw new Error("Google Calendar sync is not configured.");
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });
  return googleJson<GoogleTokenResponse>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export function getGoogleUser(accessToken: string) {
  return googleJson<GoogleUserInfo>("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function revokeGoogleToken(token: string) {
  const response = await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  });
  return response.ok;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  status?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
  location?: string;
  conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
}

interface GoogleCalendarList {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
}

interface ClassroomCourse { id: string; name: string; courseState?: string }
interface ClassroomCourses { courses?: ClassroomCourse[]; nextPageToken?: string }
interface ClassroomDate { year: number; month: number; day: number }
interface ClassroomTime { hours?: number; minutes?: number; seconds?: number; nanos?: number }
interface ClassroomWork {
  id: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  dueDate?: ClassroomDate;
  dueTime?: ClassroomTime;
}
interface ClassroomWorkList { courseWork?: ClassroomWork[]; nextPageToken?: string }

function apiHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function meetUrl(event: GoogleCalendarEvent) {
  return event.hangoutLink || event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
}

function isoFromEvent(value?: { dateTime?: string; date?: string }) {
  if (value?.dateTime) return new Date(value.dateTime).toISOString();
  if (value?.date) return `${value.date}T00:00:00.000Z`;
  return new Date().toISOString();
}

function dueDate(work: ClassroomWork) {
  if (!work.dueDate) return null;
  const time = work.dueTime || { hours: 23, minutes: 59, seconds: 59 };
  return new Date(Date.UTC(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day, time.hours || 0, time.minutes || 0, time.seconds || 0, Math.floor((time.nanos || 0) / 1_000_000))).toISOString();
}

async function calendarItems(accessToken: string, from: Date, to: Date) {
  const items: SyncedCalendarItem[] = [];
  let pageToken = "";
  do {
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", from.toISOString());
    url.searchParams.set("timeMax", to.toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "2500");
    url.searchParams.set("fields", "items(id,summary,description,status,start,end,htmlLink,hangoutLink,location,conferenceData(entryPoints(entryPointType,uri))),nextPageToken");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await googleJson<GoogleCalendarList>(url.toString(), { headers: apiHeaders(accessToken) });
    for (const event of page.items || []) {
      if (event.status === "cancelled") continue;
      const video = meetUrl(event);
      items.push({
        id: `gcal:${event.id}`,
        externalId: event.id,
        title: event.summary?.trim() || "Untitled calendar event",
        description: event.description?.trim().slice(0, 800) || "",
        kind: video ? "meeting" : "calendar",
        source: "google-calendar",
        startsAt: isoFromEvent(event.start),
        endsAt: isoFromEvent(event.end),
        allDay: Boolean(event.start.date && !event.start.dateTime),
        location: event.location,
        webUrl: event.htmlLink,
        meetUrl: video,
      });
    }
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return items;
}

async function activeCourses(accessToken: string) {
  const courses: ClassroomCourse[] = [];
  let pageToken = "";
  do {
    const url = new URL("https://classroom.googleapis.com/v1/courses");
    url.searchParams.append("courseStates", "ACTIVE");
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await googleJson<ClassroomCourses>(url.toString(), { headers: apiHeaders(accessToken) });
    courses.push(...(page.courses || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return courses;
}

async function courseAssignments(accessToken: string, course: ClassroomCourse, from: Date, to: Date) {
  const items: SyncedCalendarItem[] = [];
  let pageToken = "";
  do {
    const url = new URL(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.id)}/courseWork`);
    url.searchParams.append("courseWorkStates", "PUBLISHED");
    url.searchParams.set("orderBy", "dueDate asc");
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await googleJson<ClassroomWorkList>(url.toString(), { headers: apiHeaders(accessToken) });
    for (const work of page.courseWork || []) {
      const due = dueDate(work);
      if (!due || +new Date(due) < +from || +new Date(due) > +to) continue;
      items.push({
        id: `classroom:${course.id}:${work.id}`,
        externalId: work.id,
        title: work.title.trim(),
        description: work.description?.trim().slice(0, 800) || "",
        kind: "assignment",
        source: "google-classroom",
        startsAt: due,
        allDay: !work.dueTime,
        courseName: course.name,
        webUrl: work.alternateLink,
      });
    }
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return items;
}

export async function fetchGoogleCalendarData(accessToken: string, from = new Date(), days = 120) {
  const to = new Date(+from + days * 86_400_000);
  const warnings: string[] = [];
  const calendar = await calendarItems(accessToken, from, to);
  let assignments: SyncedCalendarItem[] = [];
  try {
    const courses = await activeCourses(accessToken);
    assignments = (await Promise.all(courses.map((course) => courseAssignments(accessToken, course, from, to)))).flat();
  } catch (error) {
    warnings.push(error instanceof Error && error.message.includes("403")
      ? "Google Classroom did not grant access. Calendar events still synced."
      : "Classroom assignments could not be refreshed this time.");
  }
  return { items: [...calendar, ...assignments].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)), warnings };
}
