import { serverValue } from "@/lib/server/calendar-config";
import { runCalendarReminderJob } from "@/lib/server/reminder-job";

export async function GET(request: Request) {
  const secret = serverValue("CRON_SECRET");
  if (!secret) return Response.json({ error: "Scheduled reminders are not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return Response.json(await runCalendarReminderJob(request.url), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The reminder job could not run." }, { status: 500 });
  }
}
