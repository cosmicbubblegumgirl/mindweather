import { googleConfig, optionalD1 } from "@/lib/server/calendar-config";
import { sessionFromRequest } from "@/lib/server/google-session";

export async function GET(request: Request) {
  const config = googleConfig(request.url);
  const session = config.configured ? await sessionFromRequest(request) : null;
  return Response.json({
    configured: config.configured,
    connected: Boolean(session),
    backgroundRemindersAvailable: Boolean(session && optionalD1()),
    email: session?.email,
    lastSyncAt: session?.lastSyncAt,
    scopes: session?.scopes,
    reason: config.configured ? undefined : "Add the Google OAuth and token-encryption server variables to enable account connection.",
  }, { headers: { "Cache-Control": "no-store" } });
}
