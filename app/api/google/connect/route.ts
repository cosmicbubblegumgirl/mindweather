import { googleAuthorizationUrl } from "@/lib/server/google-api";
import { googleConfig } from "@/lib/server/calendar-config";
import { cookieHeader, encryptPayload, pkceChallenge, randomToken, safeReturnPath } from "@/lib/server/calendar-security";
import { safeTimezone } from "@/lib/server/calendar-preferences";
import { GOOGLE_OAUTH_COOKIE, type GoogleOAuthState } from "@/lib/server/google-session";

export async function GET(request: Request) {
  const config = googleConfig(request.url);
  if (!config.configured || !config.sessionSecret) {
    return Response.json({ error: "Google Calendar sync needs server credentials before an account can be connected." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL(request.url);
  const state = randomToken();
  const verifier = randomToken(48);
  const oauthState: GoogleOAuthState = {
    state,
    verifier,
    createdAt: Date.now(),
    returnTo: safeReturnPath(url.searchParams.get("returnTo")),
    timezone: safeTimezone(url.searchParams.get("timezone")),
  };
  const encryptedState = await encryptPayload(oauthState, config.sessionSecret);
  const redirect = googleAuthorizationUrl(request.url, state, await pkceChallenge(verifier));
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirect,
      "Cache-Control": "no-store",
      "Set-Cookie": cookieHeader(GOOGLE_OAUTH_COOKIE, encryptedState, request.url, 600),
    },
  });
}
