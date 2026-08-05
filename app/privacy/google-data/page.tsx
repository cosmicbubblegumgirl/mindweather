import type { Metadata } from "next";
import { Brand } from "@/components/brand/Brand";
import { ArrowLeft, Database, Eye, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Google data & privacy",
  description: "How MindWeather accesses, uses, protects and deletes Google Calendar and Classroom data.",
};

export default function GoogleDataPrivacyPage() {
  return <main className="privacy-page">
    <nav className="privacy-page__nav"><Brand href="/" /><a href="/station#calendar"><ArrowLeft size={13} /> Back to Calendar</a></nav>
    <article className="privacy-page__content">
      <span>GOOGLE DATA & PRIVACY</span>
      <h1>A useful connection should still feel like yours.</h1>
      <p className="privacy-page__lead">This notice explains how MindWeather handles information received from Google when you choose to connect Calendar and Classroom. The connection is optional and read-only.</p>
      <small className="privacy-page__updated">Effective 5 August 2026</small>

      <div className="privacy-page__grid">
        <section><Eye /><h2>What we access</h2><ul><li>Your Google account email address.</li><li>Primary Calendar event titles, descriptions, dates, times, locations, event links and Google Meet links.</li><li>Names of active Classroom courses and published coursework titles, descriptions, links and due dates.</li></ul><p>MindWeather does not request permission to read Gmail messages, send through Gmail, edit Calendar events or change Classroom work.</p></section>
        <section><ShieldCheck /><h2>How it is used</h2><ul><li>To place meetings, events, Meet links and due work in your MindWeather calendar.</li><li>To send the email summary and reminders you enable.</li><li>To prevent the same reminder from being delivered more than once.</li></ul><p>Google user data is not used for advertising, credit decisions, profiling for sale, or training general-purpose machine-learning models.</p></section>
        <section><LockKeyhole /><h2>How it is protected</h2><p>OAuth refresh tokens are encrypted before storage. They are held server-side and are never exposed to browser code in readable form. Connection requests use a time-limited state value and PKCE. Scheduled reminder endpoints require a separate server secret, and mutating browser requests are checked for same-origin use.</p></section>
        <section><Database /><h2>Storage and sharing</h2><p>Upcoming event data is cached on your device for the calendar view. The hosted service stores the connected email, encrypted refresh token, selected reminder preferences and minimal delivery keys. Email content is sent to the configured delivery provider only to deliver your requested messages. We do not sell Google user data.</p></section>
        <section><Trash2 /><h2>Retention, deletion and your choices</h2><p>You can turn off email, meeting or deadline reminders independently. Choosing <strong>Disconnect and delete synced data</strong> in Calendar revokes the Google token, removes the server connection and delivery records, and clears the device cache. Expired reminder delivery keys are automatically removed after 90 days.</p><p>Use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. If this notice or the connected scopes change, MindWeather must ask for any newly required consent and keep the deployed privacy notice and Google consent-screen links aligned.</p></section>
      </div>

      <div className="privacy-page__actions"><a className="button button--light" href="/station#calendar">Return to Calendar</a><a className="button button--ghost" href="https://myaccount.google.com/connections" target="_blank" rel="noreferrer">Review Google account connections</a></div>
    </article>
  </main>;
}
