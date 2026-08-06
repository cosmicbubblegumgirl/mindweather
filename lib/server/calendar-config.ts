type RuntimeBindings = Record<string, unknown>;
type MindWeatherGlobal = typeof globalThis & { __mindweatherBindings?: RuntimeBindings };

interface RuntimeStatement {
  bind(...values: unknown[]): RuntimeStatement;
  run(): Promise<{ meta: { changes: number } }>;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
}

interface RuntimeDatabase {
  prepare(query: string): RuntimeStatement;
  batch(statements: RuntimeStatement[]): Promise<unknown>;
}

function bindings(): RuntimeBindings {
  return (globalThis as MindWeatherGlobal).__mindweatherBindings || {};
}

export function setCalendarRuntimeBindings(runtimeBindings: RuntimeBindings) {
  (globalThis as MindWeatherGlobal).__mindweatherBindings = runtimeBindings;
}

export function serverValue(name: string): string | undefined {
  const fromWorker = bindings()[name];
  if (typeof fromWorker === "string" && fromWorker.trim()) return fromWorker.trim();
  const fromProcess = typeof process !== "undefined" ? process.env[name] : undefined;
  return fromProcess?.trim() || undefined;
}

export function optionalD1(): RuntimeDatabase | null {
  const database = bindings().DB;
  return database && typeof database === "object" ? database as RuntimeDatabase : null;
}

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
] as const;

export function googleConfig(requestUrl?: string) {
  const clientId = serverValue("GOOGLE_CLIENT_ID");
  const clientSecret = serverValue("GOOGLE_CLIENT_SECRET");
  const encryptionKey = serverValue("GOOGLE_TOKEN_ENCRYPTION_KEY");
  const sessionSecret = serverValue("GOOGLE_SESSION_SECRET") || encryptionKey;
  const redirectUri = serverValue("GOOGLE_REDIRECT_URI") || (requestUrl ? new URL("/api/google/callback", requestUrl).toString() : undefined);
  return {
    clientId,
    clientSecret,
    encryptionKey,
    sessionSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret && encryptionKey && sessionSecret && redirectUri),
  };
}

export function emailConfig() {
  const apiKey = serverValue("RESEND_API_KEY");
  const from = serverValue("REMINDER_EMAIL_FROM");
  return { apiKey, from, configured: Boolean(apiKey && from) };
}
