-- MindWeather hosted schema. Supabase Auth owns credentials and every public
-- record is protected by authenticated-user Row Level Security.
create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  initials text not null default '',
  field text not null default '',
  focus_window text not null default '',
  learning_methods text[] not null default '{}',
  obstacles text[] not null default '{}',
  onboarded boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'atmospheric',
  reduce_motion boolean not null default false,
  large_text boolean not null default false,
  high_contrast boolean not null default false,
  notifications boolean not null default true,
  streaks boolean not null default false,
  focus_length integer not null default 25,
  break_length integer not null default 5,
  overwhelm_action text not null default 'one-task',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'MindWeather learner'
  );

  insert into public.profiles (id, name, email, initials)
  values (
    new.id,
    display_name,
    coalesce(new.email, ''),
    upper(left(regexp_replace(display_name, '[^[:alnum:]]', '', 'g'), 2))
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        initials = excluded.initials;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#a9f5ea',
  icon text not null default '✦',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text not null default '',
  deadline timestamptz not null,
  estimated_minutes integer not null default 25,
  actual_minutes integer not null default 0,
  priority integer not null default 2 check (priority between 1 and 3),
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  energy integer not null default 3 check (energy between 1 and 5),
  focus integer not null default 3 check (focus between 1 and 5),
  type text not null default 'Other',
  status text not null default 'inbox',
  notes text not null default '',
  concept_ids uuid[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weather_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weather text not null,
  energy integer not null check (energy between 1 and 5),
  focus integer not null check (focus between 1 and 5),
  stress integer not null check (stress between 1 and 5),
  motivation integer not null check (motivation between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wellbeing_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('anxiety', 'attention')),
  score integer not null check (score between 0 and 18),
  band text not null check (band in ('low-signal', 'worth-noticing', 'talk-to-someone')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  minutes integer not null default 0,
  completed_minutes integer not null default 0,
  focus_quality integer not null check (focus_quality between 1 and 5),
  felt text not null,
  method text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  deadline timestamptz not null,
  outcome text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assignment_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  title text not null,
  description text not null default '',
  estimate integer not null default 15,
  energy integer not null default 3 check (energy between 1 and 5),
  status text not null default 'not-started',
  blockers text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.concepts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  name text not null,
  x numeric not null default 50,
  y numeric not null default 50,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.concept_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_concept_id uuid not null references public.concepts(id) on delete cascade,
  to_concept_id uuid not null references public.concepts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (from_concept_id, to_concept_id)
);

create table if not exists public.concept_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id uuid not null references public.concepts(id) on delete cascade,
  level integer not null default 0 check (level between 0 and 4),
  confidence integer not null default 20 check (confidence between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, concept_id)
);

create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null,
  what_went_wrong text not null,
  original_thought text not null default '',
  correction text not null default '',
  insight text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mistake_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mistake_id uuid not null references public.mistakes(id) on delete cascade,
  stage integer not null default 0 check (stage between 0 and 4),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, mistake_id)
);

create table if not exists public.ghost_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  concept_id uuid references public.concepts(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  message text not null,
  surfaced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_dna_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  value integer not null default 50 check (value between 0 and 100),
  evidence text not null default '',
  confirmed boolean,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  text text not null,
  weather text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null default 'Studying',
  reaction text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (room_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_deadline_idx on public.tasks (user_id, deadline);
create index if not exists tasks_user_subject_idx on public.tasks (user_id, subject_id);
create index if not exists checkins_user_created_idx on public.weather_checkins (user_id, created_at desc);
create index if not exists wellbeing_user_created_idx on public.wellbeing_checkins (user_id, created_at desc);
create index if not exists sessions_user_completed_idx on public.study_sessions (user_id, completed_at desc);
create index if not exists notes_user_created_idx on public.ghost_notes (user_id, created_at desc);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_preferences','app_states','subjects','tasks','task_subtasks','weather_checkins',
    'study_sessions','wellbeing_checkins','assignments','assignment_sections','concepts','concept_connections',
    'concept_progress','mistakes','mistake_progress','ghost_notes','study_dna_metrics',
    'journal_entries','notifications'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "owner access" on public.%I', table_name);
    execute format('create policy "owner access" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
drop policy if exists "owner access" on public.profiles;
create policy "owner access" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_room_owner(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rooms
    where id = target_room_id and owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.room_members
    where room_id = target_room_id and user_id = (select auth.uid())
  );
$$;

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
drop policy if exists "room access" on public.rooms;
create policy "room access" on public.rooms for all to authenticated
  using ((select auth.uid()) = owner_id or private.is_room_member(id))
  with check ((select auth.uid()) = owner_id);
drop policy if exists "member access" on public.room_members;
create policy "member access" on public.room_members for all to authenticated
  using ((select auth.uid()) = user_id or private.is_room_owner(room_id))
  with check ((select auth.uid()) = user_id or private.is_room_owner(room_id));

revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function private.is_room_owner(uuid) from public, anon;
revoke execute on function private.is_room_member(uuid) from public, anon;
grant execute on function private.is_room_owner(uuid) to authenticated;
grant execute on function private.is_room_member(uuid) to authenticated;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists preferences_touch on public.user_preferences;
create trigger preferences_touch before update on public.user_preferences for each row execute function public.touch_updated_at();
drop trigger if exists app_states_touch on public.app_states;
create trigger app_states_touch before update on public.app_states for each row execute function public.touch_updated_at();
drop trigger if exists subjects_touch on public.subjects;
create trigger subjects_touch before update on public.subjects for each row execute function public.touch_updated_at();
drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();
drop trigger if exists subtasks_touch on public.task_subtasks;
create trigger subtasks_touch before update on public.task_subtasks for each row execute function public.touch_updated_at();
drop trigger if exists checkins_touch on public.weather_checkins;
create trigger checkins_touch before update on public.weather_checkins for each row execute function public.touch_updated_at();
drop trigger if exists wellbeing_checkins_touch on public.wellbeing_checkins;
create trigger wellbeing_checkins_touch before update on public.wellbeing_checkins for each row execute function public.touch_updated_at();
drop trigger if exists sessions_touch on public.study_sessions;
create trigger sessions_touch before update on public.study_sessions for each row execute function public.touch_updated_at();
drop trigger if exists assignments_touch on public.assignments;
create trigger assignments_touch before update on public.assignments for each row execute function public.touch_updated_at();
drop trigger if exists sections_touch on public.assignment_sections;
create trigger sections_touch before update on public.assignment_sections for each row execute function public.touch_updated_at();
drop trigger if exists concepts_touch on public.concepts;
create trigger concepts_touch before update on public.concepts for each row execute function public.touch_updated_at();
drop trigger if exists connections_touch on public.concept_connections;
create trigger connections_touch before update on public.concept_connections for each row execute function public.touch_updated_at();
drop trigger if exists concept_progress_touch on public.concept_progress;
create trigger concept_progress_touch before update on public.concept_progress for each row execute function public.touch_updated_at();
drop trigger if exists mistakes_touch on public.mistakes;
create trigger mistakes_touch before update on public.mistakes for each row execute function public.touch_updated_at();
drop trigger if exists mistake_progress_touch on public.mistake_progress;
create trigger mistake_progress_touch before update on public.mistake_progress for each row execute function public.touch_updated_at();
drop trigger if exists notes_touch on public.ghost_notes;
create trigger notes_touch before update on public.ghost_notes for each row execute function public.touch_updated_at();
drop trigger if exists dna_touch on public.study_dna_metrics;
create trigger dna_touch before update on public.study_dna_metrics for each row execute function public.touch_updated_at();
drop trigger if exists journal_touch on public.journal_entries;
create trigger journal_touch before update on public.journal_entries for each row execute function public.touch_updated_at();
drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms for each row execute function public.touch_updated_at();
drop trigger if exists members_touch on public.room_members;
create trigger members_touch before update on public.room_members for each row execute function public.touch_updated_at();
drop trigger if exists notifications_touch on public.notifications;
create trigger notifications_touch before update on public.notifications for each row execute function public.touch_updated_at();
