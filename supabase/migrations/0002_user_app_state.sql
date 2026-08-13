create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_app_state enable row level security;
drop policy if exists "owner access" on public.user_app_state;
create policy "owner access" on public.user_app_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists user_app_state_touch on public.user_app_state;
create trigger user_app_state_touch before update on public.user_app_state
  for each row execute function public.touch_updated_at();
