import type { Metadata } from "next";
import { Brand } from "@/components/brand/Brand";
import { ArrowLeft, CalendarCheck, CircleAlert, CloudCog, Handshake, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you use MindWeather.",
};

export default function TermsPage() {
  return <main className="privacy-page">
    <nav className="privacy-page__nav"><Brand href="/" /><Link href="/"><ArrowLeft size={13} /> Back to MindWeather</Link></nav>
    <article className="privacy-page__content">
      <span>TERMS OF SERVICE</span>
      <h1>A clear agreement for using MindWeather.</h1>
      <p className="privacy-page__lead">These terms explain the rules for using MindWeather, including its optional Google Calendar connection. By using the service, you agree to these terms.</p>
      <small className="privacy-page__updated">Effective 13 August 2026</small>

      <div className="privacy-page__grid">
        <section><Handshake /><h2>Using MindWeather</h2><p>You may use MindWeather if you are legally able to agree to these terms. MindWeather provides tools for daily check-ins, study planning, focus sessions and calendar viewing. You are responsible for how you use the service and for the information you enter.</p></section>
        <section><ShieldCheck /><h2>Acceptable use</h2><p>Use MindWeather lawfully and respectfully. Do not try to disrupt the service, gain unauthorized access, introduce malicious code, misuse another person&apos;s account or use the service to infringe anyone&apos;s rights.</p></section>
        <section><CalendarCheck /><h2>Google Calendar connection</h2><p>Connecting Google Calendar is optional and read-only. Your use of Google services is also governed by Google&apos;s terms. You can disconnect at any time. MindWeather&apos;s handling of Google user data is explained in the Google data &amp; privacy notice.</p></section>
        <section><CircleAlert /><h2>Not medical advice</h2><p>MindWeather is a study and planning tool. It does not provide medical, psychological or emergency services and is not a substitute for professional advice, diagnosis or treatment. If you may be in danger or need urgent support, contact an appropriate local emergency or crisis service.</p></section>
        <section><CloudCog /><h2>Availability and changes</h2><p>MindWeather may change, add or remove features, or be temporarily unavailable. We may update these terms when the service or legal requirements change. Continued use after an update means you accept the revised terms.</p></section>
        <section><Scale /><h2>Disclaimers and responsibility</h2><p>MindWeather is provided on an “as is” and “as available” basis to the extent permitted by law. We do not guarantee uninterrupted operation, error-free results or that the service will meet every need. To the extent permitted by law, MindWeather is not liable for indirect, incidental or consequential losses arising from use of the service.</p></section>
        <section><ShieldCheck /><h2>Privacy, access and contact</h2><p>Your use of MindWeather is also subject to the Google data &amp; privacy notice. You may stop using the service or disconnect Google Calendar at any time. We may restrict access when reasonably necessary to protect users, the service or comply with law. Questions about these terms can be sent to <a href="mailto:simon3m3ll3m@gmail.com">simon3m3ll3m@gmail.com</a>.</p></section>
      </div>

      <div className="privacy-page__actions"><Link className="button button--light" href="/">Return to MindWeather</Link><Link className="button button--ghost" href="/privacy/google-data">Google data &amp; privacy</Link></div>
    </article>
  </main>;
}
