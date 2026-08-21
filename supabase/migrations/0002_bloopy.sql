create table if not exists public.bloopy_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0
);

alter table public.bloopy_rate_limits enable row level security;
revoke all on public.bloopy_rate_limits from public, anon, authenticated;

create or replace function public.consume_bloopy_request(target_user uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_count integer;
begin
  if target_user is null then
    return false;
  end if;

  insert into public.bloopy_rate_limits (user_id, window_started, request_count)
  values (target_user, timezone('utc', now()), 1)
  on conflict (user_id) do update
    set window_started = case
          when public.bloopy_rate_limits.window_started < timezone('utc', now()) - interval '10 minutes'
            then timezone('utc', now())
          else public.bloopy_rate_limits.window_started
        end,
        request_count = case
          when public.bloopy_rate_limits.window_started < timezone('utc', now()) - interval '10 minutes'
            then 1
          else public.bloopy_rate_limits.request_count + 1
        end
  returning request_count into next_count;

  return next_count <= 20;
end;
$$;

revoke execute on function public.consume_bloopy_request(uuid) from public, anon, authenticated;
grant execute on function public.consume_bloopy_request(uuid) to service_role;
