# Architecture

MindWeather is a client-first App Router application with a deliberately small domain layer.

```text
app routes
  └─ providers
      └─ MindWeatherProvider
          ├─ storageService (per-user local cache + Supabase app_states)
          ├─ Supabase Auth (Google or email/password)
          ├─ domain services (tasks, weather, sessions, garden, notes)
          └─ localPlanner (deadline and capacity rules)
                ├─ feature views
                ├─ Resource Compass + print engines (local)
                └─ Bloopy local router
                      └─ authenticated Supabase Edge Function (online answers)
```

## State and persistence

`hooks/useMindWeather.tsx` owns the application context and keeps updates optimistic. `services/storageService.ts` serialises the versioned `AppState` to a per-user browser cache and the user&apos;s Row Level Security-protected `app_states` row. A fresh account starts with an empty, normalised workspace; every mutation is cached immediately and debounced to Supabase after hydration.

`services/authService.ts` uses Supabase Auth for email/password and Google ID-token sign-in. The station route remains gated until Supabase confirms the session.

## Planning engine

`lib/planningEngine.ts` contains the local rules for study plans, assignment decomposition, forecasts, roulette, and Bloop prompts. The planner is presentation-agnostic and keeps the prototype predictable and private.

## Hosted boundaries

The SQL migrations mirror the domain entities, enable per-user Row Level Security, and add Bloopy&apos;s atomic per-user request window. The static GitHub Pages app receives only public browser configuration. Google Calendar remains a separate, read-only browser session. Bloopy&apos;s OpenAI key and service-role access exist only inside the Edge Function.

Resource ranking and printable generation stay local: the ranking engine reads the existing `AppState`, and the printable view uses the browser&apos;s print/PDF flow. Bloopy sends only the current weather, study path, limited active-task summaries, learner preferences, and a short plan—not wellbeing check-in scores, journal text, or notebook contents.

## UX principles

- Capacity is a self-reflection input, never a medical assessment.
- Motion communicates cause and effect and respects reduced-motion preferences.
- The interface hides noise in Freeze Mode and never punishes unfinished work.
- Offline changes are labelled as local and unsynced.
- Every important mutation has a visible, reversible surface: reset, delete, export, or status change.
