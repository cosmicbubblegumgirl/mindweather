# Database plan

The runnable build uses versioned local storage because the request is for a local-only application. The hosted schema is ready in `supabase/migrations/0001_mindweather.sql` and follows these rules:

- Every private table has a `user_id`, timestamps, and `updated_at`.
- Foreign keys cascade only within the owning user's records.
- Row Level Security is enabled on all user-owned tables.
- Frequently filtered fields have indexes (`user_id`, status, deadline, subject, and created time).
- The seed file creates a small demo profile and related subjects, tasks, check-ins, concepts, mistakes, notes, and journal entries.

Tables: profiles, user_preferences, subjects, tasks, task_subtasks, weather_checkins, wellbeing_checkins, study_sessions, assignments, assignment_sections, concepts, concept_connections, concept_progress, mistakes, mistake_progress, ghost_notes, study_dna_metrics, journal_entries, rooms, room_members, notifications.

The migration is additive and can be applied to a development Supabase project without changing the local build.
