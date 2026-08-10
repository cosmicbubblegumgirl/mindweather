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
});

test("the weather station keeps the core check-in and rescue tools", async () => {
  const html = await page("station/index.html");
  assert.match(html, /What kind of brain day/i);
  assert.match(html, /Anxiety Rescue/i);
  assert.match(html, /ADHD Rescue/i);
  assert.match(html, /Today’s pace/i);
});

test("the key entry points are exported", async () => {
  const routes = [
    ["login/index.html", /Open your weather station/i],
    ["forgot-password/index.html", /Choose a new key/i],
    ["mobile/index.html", /iPhone install|Android install/i],
    ["privacy/google-data/index.html", /Google data/i],
  ];
  for (const [path, marker] of routes) assert.match(await page(path), marker, path);
});

test("temporary preview files are absent", async () => {
  await assert.rejects(access(new URL("app/_sites-preview", root)));
});
