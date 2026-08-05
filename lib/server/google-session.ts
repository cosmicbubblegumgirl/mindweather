import type { CalendarSyncPreferences } from "@/lib/calendar";
import { googleConfig } from "@/lib/server/calendar-config";
import { decryptPayload, encryptPayload, readCookie } from "@/lib/server/calendar-security";

export const GOOGLE_SESSION_COOKIE = "mw_google_connection";
export const GOOGLE_OAUTH_COOKIE = "mw_google_oauth";

export interface GoogleSession {
  id: string;
  email: string;
  refreshToken: string;
  scopes: string[];
  createdAt: string;
  lastSyncAt?: string;
  preferences?: CalendarSyncPreferences;
}

export interface GoogleOAuthState {
  state: string;
  verifier: string;
  createdAt: number;
  returnTo: string;
  timezone: string;
}

export async function encodeGoogleSession(session: GoogleSession, requestUrl: string) {
  const config = googleConfig(requestUrl);
  if (!config.sessionSecret) throw new Error("Google session encryption is not configured.");
  return encryptPayload(session, config.sessionSecret);
}

export async function sessionFromRequest(request: Request) {
  const config = googleConfig(request.url);
  const value = readCookie(request, GOOGLE_SESSION_COOKIE);
  if (!value || !config.sessionSecret) return null;
  return decryptPayload<GoogleSession>(value, config.sessionSecret);
}

export async function oauthStateFromRequest(request: Request) {
  const config = googleConfig(request.url);
  const value = readCookie(request, GOOGLE_OAUTH_COOKIE);
  if (!value || !config.sessionSecret) return null;
  return decryptPayload<GoogleOAuthState>(value, config.sessionSecret);
}
