# Database and account model

The production build uses Supabase Auth for accounts and Supabase Postgres for a protected, cross-device workspace copy. A per-user browser cache keeps the interface responsive and supports temporary offline use. The hosted schema lives in `supabase/migrations/0001_mindweather.sql`.

- Every private table has a user or owner key plus timestamps.
- Anonymous roles have no table privileges.
- Row Level Security scopes records to the verified `auth.uid()`.
- New Auth users automatically receive a profile and preferences row.
- `app_states` stores the current workspace JSON while normalized tables remain available for feature-specific adapters.
- Frequently filtered fields have indexes for user, status, deadline, subject, and created time.

Tables: profiles, user_preferences, app_states, subjects, tasks, task_subtasks, weather_checkins, wellbeing_checkins, study_sessions, assignments, assignment_sections, concepts, concept_connections, concept_progress, mistakes, mistake_progress, ghost_notes, study_dna_metrics, journal_entries, rooms, room_members, notifications.

The browser receives only the public Supabase URL and publishable key. Supabase Auth stores password credentials, and database policies—not client-side checks—enforce record ownership.
