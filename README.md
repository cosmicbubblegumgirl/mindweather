# MindWeather

MindWeather is a private, local-first study companion for changing brain days. It helps a learner check their current capacity, shape a realistic plan, focus on one step, and see study work beside their Google Calendar.

## Daily flow

- **Today** — choose a weather state and get a pace that fits.
- **Plan** — turn the current workload into small, visible steps.
- **Focus** — work in a contained session and reflect when it ends.
- **Calendar** — see study work and read-only Google Calendar events together.
- **Rescue tools** — use Anxiety Rescue, ADHD Rescue, and direct links to human support lines.

The wider learning features and their saved data remain available to the guided flows, while the main navigation stays intentionally small.

## Privacy

Supabase Auth verifies accounts, Postgres stores a protected workspace copy, and Row Level Security restricts every record to its owner. A per-user browser cache supports responsive and temporary offline use. Google Calendar access uses a separate short-lived browser session, requests read-only calendar permission, and does not edit or delete events.

## Run locally

Use Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Google Calendar

Create a Google OAuth web client, add the local and published site URLs as authorised JavaScript origins, then set:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-public-client-id
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Enable the Google Calendar API for the same project. Configure the Google provider in Supabase with the matching OAuth client and add Supabase's callback URL to that client. The website receives public browser configuration only; no client secret is shipped with the static site.

## Checks

```bash
npm run build
npm test
npm run lint
```

The production build is a static export in `out/`, ready for GitHub Pages.
