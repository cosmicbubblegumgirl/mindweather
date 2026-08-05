import { googleConfig, optionalD1 } from "@/lib/server/calendar-config";
import { calendarPreferences } from "@/lib/server/calendar-preferences";
import { cookieHeader, isSameOriginRequest } from "@/lib/server/calendar-security";
import { markConnectionSynced, saveConnectionPreferences } from "@/lib/server/calendar-store";
import { fetchGoogleCalendarData, refreshGoogleAccessToken } from "@/lib/server/google-api";
import { encodeGoogleSession, GOOGLE_SESSION_COOKIE, sessionFromRequest } from "@/lib/server/google-session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Origin check failed." }, { status: 403 });
  const session = await sessionFromRequest(request);
  const config = googleConfig(request.url);
  if (!session || !config.configured) return Response.json({ error: "Connect a Google account before syncing." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  try {
    const preferences = calendarPreferences(await request.json().catch(() => ({})));
    const token = await refreshGoogleAccessToken(request.url, session.refreshToken);
    const { items, warnings } = await fetchGoogleCalendarData(token.access_token);
    const syncedAt = new Date().toISOString();
    await Promise.all([markConnectionSynced(session.id, syncedAt), saveConnectionPreferences(session.id, preferences)]);
    const updated = { ...session, lastSyncAt: syncedAt, preferences };
    return Response.json({ items, syncedAt, email: session.email, backgroundRemindersAvailable: Boolean(optionalD1()), warnings }, {
      headers: { "Cache-Control": "no-store", "Set-Cookie": cookieHeader(GOOGLE_SESSION_COOKIE, await encodeGoogleSession(updated, request.url), request.url, 30 * 86_400) },
    });
  } catch (error) {
    const message = error instanceof Error && /invalid_grant|401/.test(error.message)
      ? "Google access expired or was revoked. Disconnect, then connect the account again."
      : "Google Calendar could not be refreshed right now.";
    return Response.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
