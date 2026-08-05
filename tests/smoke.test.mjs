import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("the landing page renders the product story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /MindWeather/i);
  assert.match(html, /Study for the brain you have today/i);
  assert.match(html, /Check your weather/i);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});

test("the weather station route renders the local product shell", async () => {
  const response = await render("/station");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Weather Station/i);
  assert.match(html, /What kind of brain day/i);
  assert.match(html, /Cognitive storm/i);
});

test("profile and mobile entry points render", async () => {
  const routes = [
    ["/login", /Open your weather station/i],
    ["/forgot-password", /Choose a new key/i],
    ["/mobile", /iPhone install|Android install/i],
  ];
  for (const [path, marker] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), marker, path);
  }
});

test("local build does not include temporary preview residue", async () => {
  await assert.rejects(access(new URL("app/_sites-preview", root)));
  const packageJson = await readFile(new URL("package.json", root), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
