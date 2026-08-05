-- Optional development seed. Create a local Supabase auth user first, then
-- replace the UUID below with that user's id before running this file.
begin;

do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000001';
  frontend uuid := gen_random_uuid();
  design uuid := gen_random_uuid();
  async_concept uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where id = demo_user) then
    raise notice 'Seed skipped: create auth user % first.', demo_user;
    return;
  end if;

  insert into public.profiles (id, name, email, initials, field, focus_window, learning_methods, obstacles, onboarded)
    values (demo_user, 'Simone', 'simone@local.test', 'SI', 'Frontend development', '15:20–16:10', array['Visual', 'Practising'], array['Overwhelm', 'Starting'], true)
    on conflict (id) do nothing;
  insert into public.subjects (id, user_id, name, color, icon) values
    (frontend, demo_user, 'Frontend Development', '#a9f5ea', '⌘'),
    (design, demo_user, 'UX Design', '#ffb39c', '✦');
  insert into public.concepts (id, user_id, subject_id, name, x, y, notes) values
    (async_concept, demo_user, frontend, 'Async JavaScript', 62, 32, 'Promises, queues, and timing.');
  insert into public.concept_progress (user_id, concept_id, level, confidence) values (demo_user, async_concept, 2, 58);
  insert into public.tasks (user_id, subject_id, title, description, deadline, estimated_minutes, priority, difficulty, energy, focus, type, status, notes)
    values (demo_user, frontend, 'Trace one rejected promise', 'Follow the chain until the error has a name.', timezone('utc', now()) + interval '1 day', 25, 3, 3, 3, 4, 'Practise', 'planned', 'Start at the first await.');
  insert into public.weather_checkins (user_id, weather, energy, focus, stress, motivation)
    values (demo_user, 'storm', 2, 2, 4, 3), (demo_user, 'clear', 4, 4, 2, 4);
  insert into public.ghost_notes (user_id, subject_id, concept_id, message)
    values (demo_user, frontend, async_concept, 'Future me: draw the promise chain before changing the code.');
  insert into public.journal_entries (user_id, prompt, text, weather, subject_id, tags)
    values (demo_user, 'What clicked today?', 'Naming the state made the bug feel smaller.', 'breezy', frontend, array['debugging', 'small-wins']);
end $$;

commit;
