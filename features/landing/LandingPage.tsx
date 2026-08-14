"use client";

import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { ArrowRight, CalendarDays, Check, CloudSun, Focus, ListTodo, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const steps = [
  { number: "01", title: "Name today’s weather", copy: "A quick check-in for energy, focus and stress. No scores to chase." },
  { number: "02", title: "See a plan that fits", copy: "MindWeather makes the next steps smaller or deeper, depending on the day." },
  { number: "03", title: "Start one focus block", copy: "Work on one clear thing, then decide what comes next." },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing simple-landing">
      <WeatherBackdrop weather="breezy" quiet />
      <header className="landing-nav shell-width simple-landing-nav">
        <Brand />
        <nav className={menuOpen ? "landing-nav__links is-open" : "landing-nav__links"} aria-label="Primary navigation">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#what-you-get" onClick={() => setMenuOpen(false)}>What you get</a>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link href="/signup" className="button button--small button--ghost" onClick={() => setMenuOpen(false)}>Create account</Link>
        </nav>
        <button className="icon-button landing-nav__menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="simple-hero shell-width">
        <div className="simple-hero__copy">
          <span className="eyebrow"><i /> MindWeather · A calmer way to study</span>
          <h1>MindWeather:<br />Plan for the brain<br />you have <em>today.</em></h1>
          <p>MindWeather is a study-planning web app that turns a quick energy, focus and stress check-in into a realistic plan. Focus on one task at a time, and optionally connect Google Calendar to view upcoming events alongside your study work.</p>
          <div className="hero-actions">
            <Link href="/signup" className="button button--peach">Create your account <ArrowRight size={18} /></Link>
            <a href="#how-it-works" className="simple-text-link">See how it works</a>
          </div>
          <div className="simple-trust"><span><ShieldCheck size={15} /> Private by default</span><span><Check size={15} /> Your account, your device</span></div>
        </div>

        <div className="simple-hero-card" aria-label="MindWeather preview">
          <header><span>Today</span><small>Tuesday, 10 August</small></header>
          <div className="simple-weather-summary"><span><CloudSun /></span><div><small>YOUR WEATHER</small><strong>A little foggy</strong><p>Keep the plan short and visible.</p></div></div>
          <div className="simple-next-step"><small>NEXT STEP</small><strong>Review the research notes</strong><span>12 gentle minutes</span><i><ArrowRight /></i></div>
          <footer><span>One task is enough to begin.</span></footer>
        </div>
      </section>

      <section id="how-it-works" className="simple-section shell-width">
        <header><span className="eyebrow">A simple daily rhythm</span><h2>Three steps. No dashboard maze.</h2><p>MindWeather helps you decide what fits today, then gets out of the way.</p></header>
        <div className="simple-steps">
          {steps.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}
        </div>
      </section>

      <section id="what-you-get" className="simple-section simple-features shell-width">
        <header><span className="eyebrow">Everything you need</span><h2>Four clear places.</h2></header>
        <div>
          <article><CloudSun /><span><strong>Today</strong><small>Check your weather and choose a realistic pace.</small></span></article>
          <article><ListTodo /><span><strong>Plan</strong><small>See the study steps that matter now.</small></span></article>
          <article><Focus /><span><strong>Focus</strong><small>Work in a gentle, contained session.</small></span></article>
          <article><CalendarDays /><span><strong>Calendar</strong><small>Bring Google events and study work into one view.</small></span></article>
        </div>
      </section>

      <section className="simple-cta shell-width">
        <div><span className="eyebrow">Start where you are</span><h2>Today doesn’t need a perfect plan.</h2><p>It just needs one honest check-in and one doable next step.</p></div>
        <Link href="/signup" className="button button--light">Create account <ArrowRight /></Link>
      </section>

      <footer className="simple-footer shell-width"><Brand /><p>A private study companion for changing brain days.</p><Link href="/terms">Terms of service</Link><Link href="/privacy/google-data">Google data & privacy</Link></footer>
    </main>
  );
}
