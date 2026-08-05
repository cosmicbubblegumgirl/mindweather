# MindWeather

MindWeather is a local-first study environment for deciding what kind of work fits the brain you have today. It combines a weather check-in, an adaptive plan, focus sessions, a task board, learning evidence, and a small companion called Bloop.

The product is intentionally private by default. Demo data appears immediately, and any changes are saved to this browser's local storage. No Supabase project, analytics service, or account is required to run the app.

## What is included

- Public landing page with the capacity-over-time story and an interactive plan comparison.
- Weather Station with six states, four self-reflection signals, adaptive plan preview, and the one-step Overwhelm flow.
- Adaptive Plan with a session sequence, Assignment Autopsy, Timeline, and Study Roulette.
- Tasks with creation validation, search, filters, drag-and-drop status changes, details, subtasks, and focus handoff.
- Focus Tunnel with adaptive session lengths, pause/resume, completion reflection, focus quality capture, and a weather-themed Pomodoro timer.
- Brain Forecast, Study DNA, Knowledge Constellations, Mistake Garden, Ghost Notes, Teach Bloop, Quiet Rooms, a colour-coded Google Calendar and Classroom view, Journal, notifications, search, Freeze Mode, and Settings.
- Local profile creation, login, password reset, demo mode, export, reset, and delete-data controls, plus a private install guide for iOS and Android.
- Wellbeing check-ins for anxiety and attention patterns, a 90-second grounding reset, and South African and international support links. These are reflections, not diagnoses.
- A Design Thinking and Experience Learning profile seeded from the current Classroom workload, including the sprint phases and hand-in dates, plus 200 deterministic study records for the forecast, notes, calendar and journal.
- Reduced-motion, larger text, high-contrast, mobile navigation, empty states, and offline messaging.

## Technology

Next.js App Router via vinext, React, TypeScript, Tailwind/PostCSS, Framer Motion, Lucide, Recharts, React Hook Form, Zod, TanStack Query, and a small service layer backed by `localStorage`.

The `services/` and local planning engine are deliberately kept separate from the UI. The planning rules use deadlines, task size and the learner's current weather to produce a useful demo plan without sending study data away from the device.

## Run locally

Prerequisite: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by vinext (normally `http://localhost:3000`). The mobile install guide is at `/mobile`.

Useful commands:

```bash
npm run build       # production build
npm test            # build + server-render smoke tests
npm run lint        # ESLint
npm run db:generate # Drizzle migration generation when the local schema changes
```

## Environment variables

The local app works with an empty environment. Copy `.env.example` to `.env.local` only when you want to experiment with the optional hosted adapters described in [ARCHITECTURE.md](ARCHITECTURE.md).

### Google Calendar, Meet and Classroom

The Calendar screen can connect a Google account with a read-only OAuth flow. It reads the primary Calendar, Google Meet links attached to events, active Classroom courses, and published coursework due dates. It deliberately does not request Gmail scopes; summary mail is delivered to the connected Google address through the configured mail provider.

1. In Google Cloud, enable the Google Calendar API and Google Classroom API.
2. Create a Web application OAuth client and register `http://localhost:3000/api/google/callback` for local development plus the equivalent HTTPS callback on the deployed domain.
3. Configure the OAuth consent screen with the scopes listed in `lib/server/calendar-config.ts`, the deployed homepage, and `/privacy/google-data` on the same verified domain.
4. Add the `GOOGLE_*` values from `.env.example`. Generate independent encryption and session secrets with at least 32 random bytes each.
5. For background email, create a D1 database, apply `drizzle/0000_google_calendar.sql`, add the `DB` binding, and add `RESEND_API_KEY`, `REMINDER_EMAIL_FROM`, and `CRON_SECRET` as server secrets.
6. Schedule the worker every 15 minutes. `wrangler.calendar.example.toml` contains the required D1 binding and cron trigger shape; copy the relevant entries into the real deployment configuration and replace the database ID.

Manual sync and on-device browser notifications work without D1. Scheduled email summaries and reminders require D1 plus the cron trigger so the service can run while the browser is closed. Email sends are deduplicated, tokens are encrypted at rest, and disconnecting revokes the Google token and removes the hosted connection.

Before a public launch, complete the Google OAuth verification that applies to the selected scopes, use a domain you control, publish real support contact details, and have the final privacy terms reviewed for the jurisdictions and institutions in which the product will operate.

## Project map

- `app/` — routes, root layout, providers, and global styles.
- `components/` — brand, Bloop, weather atmosphere, and shared UI.
- `features/` — product surfaces grouped by user intent.
- `hooks/` — local application state and optimistic updates.
- `lib/` — domain types, Classroom-informed demo data, weather rules, and the local planning engine.
- `services/` — storage, auth, tasks, sessions, forecast, garden, constellation, and notification logic.
- `supabase/` — optional PostgreSQL/RLS migration and demo seed for a future hosted adapter.
- `tests/` — rendered HTML smoke coverage for the local build.

The app is meant to feel like a calm instrument panel, not a generic productivity dashboard. The plan can get smaller, Freeze Mode can hide the noise, and progress is recorded as evidence rather than a streak score.
