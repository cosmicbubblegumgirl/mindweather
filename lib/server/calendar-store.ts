import type { CalendarSyncPreferences } from "@/lib/calendar";
import { optionalD1 } from "@/lib/server/calendar-config";
import type { GoogleSession } from "@/lib/server/google-session";

export interface StoredGoogleConnection extends GoogleSession {
  preferences: CalendarSyncPreferences;
}

export async function storeGoogleConnection(session: GoogleSession, encryptedRefreshToken: string, preferences: CalendarSyncPreferences) {
  const db = optionalD1();
  if (!db) return false;
  try {
    await db.prepare(`INSERT INTO google_connections
      (id, email, encrypted_refresh_token, scopes, timezone, email_enabled, meeting_reminders, deadline_reminders, digest_hour, created_at, updated_at, last_sync_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        id = excluded.id, encrypted_refresh_token = excluded.encrypted_refresh_token, scopes = excluded.scopes,
        timezone = excluded.timezone, email_enabled = excluded.email_enabled, meeting_reminders = excluded.meeting_reminders,
        deadline_reminders = excluded.deadline_reminders, digest_hour = excluded.digest_hour, updated_at = excluded.updated_at,
        revoked_at = NULL`)
      .bind(session.id, session.email, encryptedRefreshToken, JSON.stringify(session.scopes), preferences.timezone, preferences.emailDigest ? 1 : 0, preferences.meetingReminders ? 1 : 0, preferences.deadlineReminders ? 1 : 0, preferences.digestHour, session.createdAt, session.createdAt, session.lastSyncAt || null)
      .run();
    return true;
  } catch {
    return false;
  }
}

export async function saveConnectionPreferences(id: string, preferences: CalendarSyncPreferences) {
  const db = optionalD1();
  if (!db) return false;
  try {
    const result = await db.prepare(`UPDATE google_connections SET timezone = ?, email_enabled = ?, meeting_reminders = ?, deadline_reminders = ?, digest_hour = ?, updated_at = ? WHERE id = ? AND revoked_at IS NULL`)
      .bind(preferences.timezone, preferences.emailDigest ? 1 : 0, preferences.meetingReminders ? 1 : 0, preferences.deadlineReminders ? 1 : 0, preferences.digestHour, new Date().toISOString(), id)
      .run();
    return Boolean(result.meta.changes);
  } catch {
    return false;
  }
}

export async function markConnectionSynced(id: string, at: string) {
  const db = optionalD1();
  if (!db) return false;
  try {
    await db.prepare("UPDATE google_connections SET last_sync_at = ?, updated_at = ? WHERE id = ?").bind(at, at, id).run();
    return true;
  } catch {
    return false;
  }
}

export async function deleteGoogleConnection(id: string) {
  const db = optionalD1();
  if (!db) return false;
  try {
    await db.batch([
      db.prepare("DELETE FROM reminder_deliveries WHERE connection_id = ?").bind(id),
      db.prepare("DELETE FROM google_connections WHERE id = ?").bind(id),
    ]);
    return true;
  } catch {
    return false;
  }
}

interface ConnectionRow {
  id: string;
  email: string;
  encrypted_refresh_token: string;
  scopes: string;
  timezone: string;
  email_enabled: number;
  meeting_reminders: number;
  deadline_reminders: number;
  digest_hour: number;
  created_at: string;
  last_sync_at: string | null;
}

export async function listGoogleConnections() {
  const db = optionalD1();
  if (!db) return [] as ConnectionRow[];
  const result = await db.prepare("SELECT * FROM google_connections WHERE revoked_at IS NULL").all<ConnectionRow>();
  return result.results;
}

export async function deliveryExists(connectionId: string, kind: string, itemKey: string) {
  const db = optionalD1();
  if (!db) return false;
  const row = await db.prepare("SELECT id FROM reminder_deliveries WHERE connection_id = ? AND kind = ? AND item_key = ? LIMIT 1").bind(connectionId, kind, itemKey).first<{ id: string }>();
  return Boolean(row);
}

export async function recordDelivery(connectionId: string, kind: string, itemKey: string) {
  const db = optionalD1();
  if (!db) return;
  await db.prepare("INSERT OR IGNORE INTO reminder_deliveries (id, connection_id, kind, item_key, delivered_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), connectionId, kind, itemKey, new Date().toISOString()).run();
}

export async function pruneDeliveries() {
  const db = optionalD1();
  if (!db) return;
  await db.prepare("DELETE FROM reminder_deliveries WHERE delivered_at < datetime('now', '-90 days')").run();
}
