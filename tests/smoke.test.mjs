import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function page(path = "index.html") {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("the landing page presents the simpler product story", async () => {
  const html = await page();
  assert.match(html, /MindWeather/i);
  assert.match(html, /Plan for the brain/i);
  assert.match(html, /Three steps\. No dashboard maze/i);
  assert.match(html, /Four clear places/i);
  assert.doesNotMatch(html, />Open MindWeather</i);
});

test("the weather station is hidden until Supabase verifies the account", async () => {
  const html = await page("station/index.html");
  assert.match(html, /ACCOUNT REQUIRED/i);
  assert.match(html, /Checking your secure session/i);
  assert.doesNotMatch(html, /simone@mindweather\.local/i);
});

test("the key entry points are exported", async () => {
  const routes = [
    ["login/index.html", /Open your weather station/i],
    ["signup/index.html", /Create your account/i],
    ["forgot-password/index.html", /Reset your password/i],
    ["mobile/index.html", /iPhone install|Android install/i],
    ["privacy/google-data/index.html", /Google sign-in/i],
    ["terms/index.html", /Terms of Service/i],
  ];
  for (const [path, marker] of routes) assert.match(await page(path), marker, path);
});

test("the account entry points expose Google sign-in and GitHub Pages-safe links", async () => {
  const login = await page("login/index.html");
  const landing = await page();
  assert.match(login, /Continue with Google/i);
  assert.match(login, /Calendar permission stays separate/i);
  assert.doesNotMatch(login, /Continue without an account/i);
  assert.match(landing, /href="(?:\/mindweather)?\/login\/?"/i);
  assert.match(landing, /href="(?:\/mindweather)?\/signup\/?"/i);
});

test("accounts and study data use authenticated Supabase storage", async () => {
  const authSource = await readFile(new URL("../services/authService.ts", import.meta.url), "utf8");
  const storageSource = await readFile(new URL("../services/storageService.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/0001_mindweather.sql", import.meta.url), "utf8");
  assert.match(authSource, /signInWithPassword/);
  assert.match(authSource, /signInWithIdToken/);
  assert.match(authSource, /auth\.getUser\(\)/);
  assert.match(storageSource, /from\("app_states"\)/);
  assert.match(storageSource, /mindweather\.user\.v2/);
  assert.match(migration, /revoke all on all tables in schema public from anon/i);
  assert.match(migration, /to authenticated using \(\(select auth\.uid\(\)\)/i);
});

test("Google sign-in never auto-selects an account and connected calendars auto-refresh", async () => {
  const identitySource = await readFile(new URL("../services/googleIdentityService.ts", import.meta.url), "utf8");
  const calendarSource = await readFile(new URL("../features/calendar/CalendarView.tsx", import.meta.url), "utf8");
  assert.match(identitySource, /auto_select:\s*false/);
  assert.doesNotMatch(identitySource, /auto_select:\s*true/);
  assert.match(identitySource, /nonce:/);
  assert.match(calendarSource, /if \(status\.connected\) void syncNow\(\)/);
  assert.match(calendarSource, /refreshes automatically while this browser session is open/i);
});

test("temporary preview files are absent", async () => {
  await assert.rejects(access(new URL("app/_sites-preview", root)));
});
