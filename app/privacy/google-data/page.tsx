import type { Metadata } from "next";
import { Brand } from "@/components/brand/Brand";
import { ArrowLeft, Database, Eye, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google data & privacy",
  description: "How MindWeather accesses, uses, protects and deletes Google Calendar data.",
};

export default function GoogleDataPrivacyPage() {
  return <main className="privacy-page">
    <nav className="privacy-page__nav"><Brand href="/" /><Link href="/station#calendar"><ArrowLeft size={13} /> Back to Calendar</Link></nav>
    <article className="privacy-page__content">
      <span>GOOGLE DATA & PRIVACY</span>
      <h1>A useful connection should still feel like yours.</h1>
      <p className="privacy-page__lead">This notice explains how MindWeather handles information received from Google when you connect your calendar. The connection is optional and read-only.</p>
      <small className="privacy-page__updated">Effective 10 August 2026</small>

      <div className="privacy-page__grid">
        <section><Eye /><h2>What we access</h2><ul><li>Your Google account email address.</li><li>Primary Calendar event titles, descriptions, dates, times, locations, event links and Google Meet links.</li></ul><p>MindWeather does not request permission to read Gmail, send messages, or edit and delete Calendar events.</p></section>
        <section><ShieldCheck /><h2>How it is used</h2><ul><li>To show meetings, events and Meet links beside your study plan.</li><li>To let you open the original event or join its meeting.</li></ul><p>Your Google information is not sold, shared for advertising, or used for unrelated profiling.</p></section>
        <section><LockKeyhole /><h2>How it is protected</h2><p>The Google access token is kept in the current browser session and expires after a short period. MindWeather does not receive or store your Google password, and it does not ship a Google client secret in the website.</p></section>
        <section><Database /><h2>Storage and sharing</h2><p>Upcoming event details and the connected email are cached on this device so the calendar remains useful between visits. Calendar requests go directly from your browser to Google. MindWeather does not run a separate calendar database or send your events to another service.</p></section>
        <section><Trash2 /><h2>Deletion and your choices</h2><p>Choosing <strong>Disconnect</strong> revokes the current Google token and clears cached Google Calendar data from this device. You can also remove MindWeather from your Google account connections at any time.</p><p>Information received from Google APIs is handled under the Google API Services User Data Policy, including the Limited Use requirements.</p></section>
      </div>

      <div className="privacy-page__actions"><Link className="button button--light" href="/station#calendar">Return to Calendar</Link><a className="button button--ghost" href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Review Google account connections</a></div>
    </article>
  </main>;
}
