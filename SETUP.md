# Local setup

## Prerequisites

- Node.js 22+
- npm 10+

## Install and run

```bash
npm install
npm run dev
```

The dev server prints the local URL. A configured Supabase project is required for account access and protected cloud state. Visit `/mobile` for the install steps for iOS and Android.

## Resetting local data

Open Settings → Data to export, reset, or delete the current profile. The browser cache uses a per-user `mindweather.user.v2.*` key and syncs the protected workspace to Supabase after account verification.

## Supabase setup

Apply the migrations in order, configure Google as an optional Supabase Auth provider, and set the public URL and publishable key in the website environment. Keep the service-role key server-only. The local planning engine and Bloopy&apos;s navigation shortcuts remain available when an online answer cannot be reached.

For Bloopy, deploy `supabase/functions/bloopy`, set `OPENAI_API_KEY` and `SITE_URL` as Edge Function secrets, and optionally set `OPENAI_MODEL`. The function validates the signed-in user itself, limits each account to 20 requests per ten-minute window, sends only a small study context, and asks the OpenAI Responses API not to store the response. Full commands are in [`BLOOPY.md`](BLOOPY.md).

## Verification

```bash
npm run build
npm test
npm run lint
```
