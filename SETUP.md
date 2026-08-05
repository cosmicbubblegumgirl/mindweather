# Local setup

## Prerequisites

- Node.js 22+
- npm 10+

## Install and run

```bash
npm install
npm run dev
```

The dev server prints the local URL. The app is usable immediately through the demo profile; no sign-in or external service is needed. Visit `/mobile` for the install steps for iOS and Android.

## Resetting local data

Open Settings → Data to export, reset, or delete the current profile. For a manual reset, remove the `mindweather.local.v1` and `mindweather.local.accounts.v1` keys from the browser's local storage.

## Optional hosted setup

The local adapter is the default. If a future deployment enables Supabase, apply `supabase/migrations/0001_mindweather.sql`, then run `supabase/seed.sql` against a development project. Keep the service-role key server-only. The local planning engine remains available when no hosted services are configured.

## Verification

```bash
npm run build
npm test
npm run lint
```
