import { calendarPreferences } from "@/lib/server/calendar-preferences";
import { cookieHeader, isSameOriginRequest } from "@/lib/server/calendar-security";
import { optionalD1 } from "@/lib/server/calendar-config";
import { saveConnectionPreferences } from "@/lib/server/calendar-store";
import { encodeGoogleSession, GOOGLE_SESSION_COOKIE, sessionFromRequest } from "@/lib/server/google-session";

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Origin check failed." }, { status: 403 });
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ error: "Connect a Google account first." }, { status: 401 });
  const preferences = calendarPreferences(await request.json().catch(() => ({})));
  const saved = await saveConnectionPreferences(session.id, preferences);
  const updated = { ...session, preferences };
  return Response.json({ saved, backgroundRemindersAvailable: Boolean(optionalD1()) }, {
    headers: { "Cache-Control": "no-store", "Set-Cookie": cookieHeader(GOOGLE_SESSION_COOKIE, await encodeGoogleSession(updated, request.url), request.url, 30 * 86_400) },
  });
}
