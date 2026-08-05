import { clearCookieHeader, isSameOriginRequest } from "@/lib/server/calendar-security";
import { deleteGoogleConnection } from "@/lib/server/calendar-store";
import { revokeGoogleToken } from "@/lib/server/google-api";
import { GOOGLE_SESSION_COOKIE, sessionFromRequest } from "@/lib/server/google-session";

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Origin check failed." }, { status: 403 });
  const session = await sessionFromRequest(request);
  if (session) await Promise.allSettled([revokeGoogleToken(session.refreshToken), deleteGoogleConnection(session.id)]);
  return Response.json({ disconnected: true }, { headers: { "Cache-Control": "no-store", "Set-Cookie": clearCookieHeader(GOOGLE_SESSION_COOKIE, request.url) } });
}
