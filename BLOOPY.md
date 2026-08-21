# Bloopy architecture and deployment

Bloopy has two deliberately separate layers.

1. `lib/bloopyKnowledge.ts` handles app knowledge, navigation, next-step suggestions, Resource Compass handoffs, and printable handoffs in the browser. Those flows still work offline.
2. `supabase/functions/bloopy/index.ts` handles open-ended answers. It requires a valid Supabase user, keeps private credentials server-side, and can offer OpenAI web search only when the learner has enabled the web toggle.

The browser sends a bounded context: current cognitive weather, study field/path, support preference, learning methods, subject names, up to eight active task summaries, and up to four plan steps. It does not send wellbeing scores, journals, notebook text, uploaded files, or the complete workspace.

## Deploy

Use a Supabase access token with permission to the project.

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase secrets set OPENAI_API_KEY=YOUR_PRIVATE_KEY SITE_URL=https://mymindweather.study
npx supabase secrets set OPENAI_MODEL=gpt-5.4-mini
npx supabase functions deploy bloopy --no-verify-jwt
```

`--no-verify-jwt` is intentional: the function validates the current bearer token with `auth.getUser()` inside the function, which keeps the check compatible with the project&apos;s publishable browser key. The function rejects missing/invalid sessions and unapproved browser origins.

## Request safety

- `0002_bloopy.sql` adds an atomic 20-requests-per-ten-minutes account window.
- Each message is limited to 1,200 characters and only the latest eight turns are accepted.
- Responses are requested with `store: false`.
- Web search is absent from the request unless the learner turns it on.
- URL citations returned by the Responses API are reduced to a small visible source list.
- Model and provider errors become a calm local fallback; private error payloads are not exposed to the browser.

The Edge Function expects Supabase&apos;s built-in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` variables plus the two secrets above.
