import { decryptPayload } from "@/lib/server/calendar-security";
import { googleConfig } from "@/lib/server/calendar-config";
import { deliveryExists, listGoogleConnections, pruneDeliveries, recordDelivery } from "@/lib/server/calendar-store";
import { sendCalendarEmail } from "@/lib/server/calendar-email";
import { fetchGoogleCalendarData, refreshGoogleAccessToken } from "@/lib/server/google-api";

function localClock(timezone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return { date: `${read("year")}-${read("month")}-${read("day")}`, hour: Number(read("hour")) };
}

export async function runCalendarReminderJob(requestUrl: string) {
  const config = googleConfig(requestUrl);
  if (!config.encryptionKey) throw new Error("Google token encryption is not configured.");
  const connections = await listGoogleConnections();
  const result = { checked: connections.length, sent: 0, failed: 0 };

  for (const connection of connections) {
    try {
      const refreshToken = await decryptPayload<string>(connection.encrypted_refresh_token, config.encryptionKey);
      if (!refreshToken) throw new Error("Stored Google token could not be decrypted.");
      const token = await refreshGoogleAccessToken(requestUrl, refreshToken);
      const { items } = await fetchGoogleCalendarData(token.access_token, new Date(), 14);
      const now = new Date();
      const clock = localClock(connection.timezone, now);

      if (connection.email_enabled && clock.hour === connection.digest_hour) {
        const deliveryKey = `digest:${clock.date}`;
        if (!await deliveryExists(connection.id, "digest", deliveryKey)) {
          const upcoming = items.filter((item) => +new Date(item.startsAt) > +now && +new Date(item.startsAt) <= +now + 7 * 86_400_000);
          if (upcoming.length) {
            await sendCalendarEmail({ to: connection.email, timezone: connection.timezone, subject: "Your meetings and deadlines", intro: "A calm look at the next seven days, in time order.", items: upcoming });
            await recordDelivery(connection.id, "digest", deliveryKey);
            result.sent += 1;
          }
        }
      }

      const meetingReminders = connection.meeting_reminders ? items.filter((item) => item.kind === "meeting" && +new Date(item.startsAt) > +now && +new Date(item.startsAt) <= +now + 15 * 60_000) : [];
      for (const item of meetingReminders) {
        const deliveryKey = `${item.id}:${item.startsAt}`;
        if (await deliveryExists(connection.id, "meeting", deliveryKey)) continue;
        await sendCalendarEmail({ to: connection.email, timezone: connection.timezone, subject: `Meeting in 15 minutes · ${item.title}`, intro: item.meetUrl ? "Your Google Meet link is included below." : "Your meeting is coming up shortly.", items: [item] });
        await recordDelivery(connection.id, "meeting", deliveryKey);
        result.sent += 1;
      }

      const deadlineReminders = connection.deadline_reminders ? items.filter((item) => item.kind === "assignment" && +new Date(item.startsAt) > +now && +new Date(item.startsAt) <= +now + 72 * 3_600_000) : [];
      for (const item of deadlineReminders) {
        const deliveryKey = `${item.id}:${item.startsAt}`;
        if (await deliveryExists(connection.id, "deadline", deliveryKey)) continue;
        await sendCalendarEmail({ to: connection.email, timezone: connection.timezone, subject: `Due in 3 days · ${item.title}`, intro: "A gentle early signal, with enough room to reshape the work.", items: [item] });
        await recordDelivery(connection.id, "deadline", deliveryKey);
        result.sent += 1;
      }
    } catch {
      result.failed += 1;
    }
  }
  await pruneDeliveries();
  return result;
}
