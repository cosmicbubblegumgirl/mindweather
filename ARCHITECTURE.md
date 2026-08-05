# Architecture

MindWeather is a client-first App Router application with a deliberately small domain layer.

```text
app routes
  └─ providers
      └─ MindWeatherProvider
          ├─ storageService (localStorage)
          ├─ domain services (tasks, weather, sessions, garden, notes)
          └─ localPlanner (deadline and capacity rules)
                └─ feature views
```

## State and persistence

`hooks/useMindWeather.tsx` owns the application context and keeps updates optimistic. `services/storageService.ts` serialises the versioned `AppState` to one device-local record. The first load hydrates realistic demo data from `lib/demo-data.ts`; every mutation is persisted after hydration.

Authentication is intentionally local in this build. `services/authService.ts` hashes the local password with the browser Web Crypto API and stores only the account record and active email on the device. This is useful for a prototype, not a replacement for a hosted identity provider.

## Planning engine

`lib/planningEngine.ts` contains the local rules for study plans, assignment decomposition, forecasts, roulette, and Bloop prompts. The planner is presentation-agnostic and keeps the prototype predictable and private.

## Future hosted adapter

The SQL migration in `supabase/migrations/` mirrors the local domain entities and enables per-user Row Level Security. A future adapter can replace the storage service while preserving the React features. Realtime rooms map naturally to Supabase presence; uploads can use Storage with allowlisted file types and size limits.

## UX principles

- Capacity is a self-reflection input, never a medical assessment.
- Motion communicates cause and effect and respects reduced-motion preferences.
- The interface hides noise in Freeze Mode and never punishes unfinished work.
- Offline changes are labelled as local and unsynced.
- Every important mutation has a visible, reversible surface: reset, delete, export, or status change.
