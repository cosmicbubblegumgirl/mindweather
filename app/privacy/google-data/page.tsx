import type { Metadata } from "next";
import { Brand } from "@/components/brand/Brand";
import { ArrowLeft, Database, Eye, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google data & privacy",
  description: "How MindWeather handles Google sign-in and Google Calendar data.",
};

export default function GoogleDataPrivacyPage() {
  return <main className="privacy-page">
    <nav className="privacy-page__nav"><Brand href="/" /><Link href="/station#calendar"><ArrowLeft size={13} /> Back to Calendar</Link></nav>
    <article className="privacy-page__content">
      <span>GOOGLE DATA & PRIVACY</span>
      <h1>A useful connection should still feel like yours.</h1>
      <p className="privacy-page__lead">This notice explains how MindWeather handles information received from Google when you sign in or connect your calendar. Google sign-in is optional, and Calendar access is a separate, read-only connection.</p>
      <small className="privacy-page__updated">Effective 13 August 2026</small>

      <div className="privacy-page__grid">
        <section><Eye /><h2>What we access</h2><ul><li>For Google sign-in: your Google account identifier, name and verified email address.</li><li>If you separately connect Calendar: primary Calendar event titles, descriptions, dates, times, locations, event links and Google Meet links.</li></ul><p>MindWeather does not request permission to read Gmail, send messages, or edit and delete Calendar events.</p></section>
        <section><ShieldCheck /><h2>How it is used</h2><ul><li>To create or open your device-local MindWeather profile.</li><li>To show meetings, events and Meet links beside your study plan.</li><li>To let you open the original event or join its meeting.</li></ul><p>Your Google information is not sold, shared for advertising, or used for unrelated profiling.</p></section>
        <section><LockKeyhole /><h2>How it is protected</h2><p>The Google access token is kept in the current browser session and expires after a short period. MindWeather does not receive or store your Google password, and it does not ship a Google client secret in the website.</p></section>
        <section><Database /><h2>Storage and sharing</h2><p>Your Google account identifier, name and email are stored in this browser with your device profile. Upcoming event details and the connected email are also cached on this device. Requests go directly from your browser to Google; MindWeather does not run a separate account or calendar database.</p></section>
        <section><Trash2 /><h2>Deletion and your choices</h2><p>Signing out closes the local account session but does not delete study data. Choosing <strong>Disconnect</strong> revokes the current Google Calendar token and clears cached Calendar data. You can clear all local data in Settings and remove MindWeather from your Google account connections at any time.</p><p>Information received from Google APIs is handled under the Google API Services User Data Policy, including the Limited Use requirements.</p></section>
      </div>

      <div className="privacy-page__actions"><Link className="button button--light" href="/station#calendar">Return to Calendar</Link><a className="button button--ghost" href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Review Google account connections</a></div>
    </article>
  </main>;
}
