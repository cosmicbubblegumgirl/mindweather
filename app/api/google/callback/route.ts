import { defaultCalendarPreferences } from "@/lib/calendar";
import { googleConfig } from "@/lib/server/calendar-config";
import { encryptPayload } from "@/lib/server/calendar-security";
import { clearCookieHeader, cookieHeader } from "@/lib/server/calendar-security";
import { storeGoogleConnection } from "@/lib/server/calendar-store";
import { exchangeGoogleCode, getGoogleUser } from "@/lib/server/google-api";
import { encodeGoogleSession, GOOGLE_OAUTH_COOKIE, GOOGLE_SESSION_COOKIE, oauthStateFromRequest, type GoogleSession } from "@/lib/server/google-session";

function returnUrl(requestUrl: string, path: string, status: string) {
  const target = new URL(path, requestUrl);
  target.searchParams.set("google", status);
  return target.toString();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauth = await oauthStateFromRequest(request);
  const config = googleConfig(request.url);
  const error = url.searchParams.get("error");
  if (error || !oauth || Date.now() - oauth.createdAt > 10 * 60_000 || oauth.state !== url.searchParams.get("state")) {
    const target = returnUrl(request.url, oauth?.returnTo || "/station#calendar", error === "access_denied" ? "cancelled" : "invalid");
    return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store", "Set-Cookie": clearCookieHeader(GOOGLE_OAUTH_COOKIE, request.url) } });
  }

  try {
    const code = url.searchParams.get("code");
    if (!code || !config.encryptionKey) throw new Error("The Google authorization response was incomplete.");
    const token = await exchangeGoogleCode(request.url, code, oauth.verifier);
    if (!token.refresh_token) throw new Error("Google did not return an offline refresh token. Reconnect and grant consent again.");
    const user = await getGoogleUser(token.access_token);
    if (!user.email || user.email_verified === false) throw new Error("The connected Google email could not be verified.");

    const preferences = { ...defaultCalendarPreferences(), timezone: oauth.timezone };
    const session: GoogleSession = {
      id: crypto.randomUUID(),
      email: user.email,
      refreshToken: token.refresh_token,
      scopes: (token.scope || "").split(" ").filter(Boolean),
      createdAt: new Date().toISOString(),
      preferences,
    };
    const background = await storeGoogleConnection(session, await encryptPayload(token.refresh_token, config.encryptionKey), preferences);
    const sessionCookie = await encodeGoogleSession(session, request.url);
    const target = new URL(returnUrl(request.url, oauth.returnTo, "connected"));
    if (!background) target.searchParams.set("background", "setup-needed");
    const headers = new Headers({ Location: target.toString(), "Cache-Control": "no-store" });
    headers.append("Set-Cookie", cookieHeader(GOOGLE_SESSION_COOKIE, sessionCookie, request.url, 30 * 86_400));
    headers.append("Set-Cookie", clearCookieHeader(GOOGLE_OAUTH_COOKIE, request.url));
    return new Response(null, { status: 302, headers });
  } catch {
    const target = returnUrl(request.url, oauth.returnTo, "failed");
    return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store", "Set-Cookie": clearCookieHeader(GOOGLE_OAUTH_COOKIE, request.url) } });
  }
}
