CREATE TABLE IF NOT EXISTS `google_connections` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `encrypted_refresh_token` text NOT NULL,
  `scopes` text NOT NULL,
  `timezone` text NOT NULL DEFAULT 'UTC',
  `email_enabled` integer NOT NULL DEFAULT 1,
  `meeting_reminders` integer NOT NULL DEFAULT 1,
  `deadline_reminders` integer NOT NULL DEFAULT 1,
  `digest_hour` integer NOT NULL DEFAULT 7,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `last_sync_at` text,
  `revoked_at` text
);

CREATE INDEX IF NOT EXISTS `google_connections_active_idx`
  ON `google_connections` (`revoked_at`, `email_enabled`);

CREATE TABLE IF NOT EXISTS `reminder_deliveries` (
  `id` text PRIMARY KEY NOT NULL,
  `connection_id` text NOT NULL,
  `kind` text NOT NULL,
  `item_key` text NOT NULL,
  `delivered_at` text NOT NULL,
  FOREIGN KEY (`connection_id`) REFERENCES `google_connections` (`id`) ON DELETE CASCADE,
  UNIQUE (`connection_id`, `kind`, `item_key`)
);

CREATE INDEX IF NOT EXISTS `reminder_deliveries_age_idx`
  ON `reminder_deliveries` (`delivered_at`);
