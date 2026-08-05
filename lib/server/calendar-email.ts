import type { SyncedCalendarItem } from "@/lib/calendar";
import { emailConfig } from "@/lib/server/calendar-config";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

function formattedDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", { timeZone: timezone, weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function itemLine(item: SyncedCalendarItem, timezone: string) {
  const label = item.kind === "assignment" ? "DEADLINE" : item.kind === "meeting" ? "MEETING" : "CALENDAR";
  const detail = [item.courseName, item.location].filter(Boolean).join(" · ");
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #e8e5f1"><div style="font:700 10px Arial;color:#6f5ec4;letter-spacing:.12em">${label}</div><div style="font:700 15px Arial;color:#18162c;margin-top:5px">${escapeHtml(item.title)}</div><div style="font:12px Arial;color:#6f6a7d;margin-top:5px">${escapeHtml(formattedDate(item.startsAt, timezone))}${detail ? ` · ${escapeHtml(detail)}` : ""}</div>${item.webUrl ? `<a href="${escapeHtml(item.webUrl)}" style="display:inline-block;margin-top:8px;font:700 11px Arial;color:#6752c7">Open details →</a>` : ""}</td></tr>`;
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const config = emailConfig();
  if (!config.configured || !config.apiKey || !config.from) throw new Error("Reminder email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.from, to: [to], subject, html, text }),
  });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status}).`);
}

export async function sendCalendarEmail(input: { to: string; timezone: string; subject: string; intro: string; items: SyncedCalendarItem[] }) {
  const rows = input.items.map((item) => itemLine(item, input.timezone)).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f4fb"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#111027;border-radius:22px 22px 0 0;padding:24px 26px;color:white"><div style="font:700 11px Arial;letter-spacing:.18em;color:#8fe7dd">MINDWEATHER</div><h1 style="font:600 27px Arial;margin:12px 0 7px">${escapeHtml(input.subject)}</h1><p style="font:13px/1.6 Arial;color:#c3bed3;margin:0">${escapeHtml(input.intro)}</p></div><div style="background:white;border-radius:0 0 22px 22px;padding:10px 26px 22px"><table role="presentation" style="width:100%;border-collapse:collapse">${rows}</table><p style="font:11px/1.5 Arial;color:#898496;margin:20px 0 0">Read-only Google sync · Manage or disconnect this account from MindWeather Calendar.</p></div></div></body></html>`;
  const text = `${input.subject}\n\n${input.intro}\n\n${input.items.map((item) => `${item.kind.toUpperCase()}: ${item.title} — ${formattedDate(item.startsAt, input.timezone)}${item.webUrl ? ` — ${item.webUrl}` : ""}`).join("\n")}`;
  await sendEmail(input.to, input.subject, html, text);
}
