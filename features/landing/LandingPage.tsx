"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { ArrowDown, ArrowRight, Brain, Check, CloudLightning, Compass, Menu, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const normalPlan = ["14:00 · Calculus", "15:00 · Research", "16:00 · Assignment", "17:00 · Revision"];
const adaptivePlan = ["8 min · organise research notes", "3 min · reset", "12 min · visual revision", "5 min · mini quiz"];

export function LandingPage() {
  const [adaptive, setAdaptive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <main className="landing">
      <WeatherBackdrop weather="breezy" />
      <header className="landing-nav shell-width">
        <Brand />
        <nav className={menuOpen ? "landing-nav__links is-open" : "landing-nav__links"} aria-label="Primary navigation">
          <a href="#difference" onClick={() => setMenuOpen(false)}>The difference</a>
          <a href="#systems" onClick={() => setMenuOpen(false)}>Inside the station</a>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Create profile</Link>
          <Link href="/station" className="button button--small button--light">Open weather station <ArrowRight size={15} /></Link>
        </nav>
        <button className="icon-button landing-nav__menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="landing-hero shell-width">
        <motion.div className="landing-hero__copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="eyebrow"><i /> Your cognitive weather station</span>
          <h1>Study for the brain<br />you have <em>today.</em></h1>
          <p>Your timetable shouldn’t assume your brain feels the same every day. MindWeather reshapes the plan around the capacity that actually showed up.</p>
          <div className="hero-actions">
            <Link href="/station" className="button button--peach">Check your weather <ArrowRight size={18} /></Link>
            <a href="#difference" className="button button--ghost">Explore MindWeather <ArrowDown size={18} /></a>
          </div>
          <div className="landing-hero__trust"><span><Check size={14} /> Stays on this device</span><span><Check size={14} /> No account needed</span><span><Check size={14} /> Not a medical assessment</span></div>
        </motion.div>

        <div className="orbit-stage" aria-label="A preview of the MindWeather study dashboard">
          <motion.div className="orbit orbit--outer" animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }}><i /><i /><i /></motion.div>
          <motion.div className="orbit-card orbit-card--weather" animate={reduced ? undefined : { y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
            <CloudLightning size={17} /><span><small>Today</small><strong>Cognitive storm</strong></span>
          </motion.div>
          <motion.div className="orbit-card orbit-card--focus" animate={reduced ? undefined : { y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity }}><span>Next step</span><strong>Open your notes</strong><small>8 gentle minutes</small></motion.div>
          <motion.div className="hero-station" animate={reduced ? undefined : { y: [0, -7, 0], rotateX: [0, 1.5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <div className="hero-station__top"><span className="window-dots"><i /><i /><i /></span><span>WEATHER STATION</span><span>15:26</span></div>
            <div className="hero-station__body">
              <div className="mini-sidebar"><Image src="/mindweather-mark.svg" alt="" width={28} height={28} /><i className="is-active" /><i /><i /><i /></div>
              <div className="mini-content">
                <span className="mini-label">GOOD AFTERNOON, SIMONE</span>
                <h3>What kind of brain day<br />are we working with?</h3>
                <div className="mini-weather-row"><button>☀<small>Clear</small></button><button>≋<small>Breezy</small></button><button className="active">ϟ<small>Storm</small></button></div>
                <div className="mini-plan"><span><i /> Your plan just got lighter</span><strong>8 min · Organise research notes</strong><small>One small start. The rest can wait.</small></div>
              </div>
            </div>
          </motion.div>
          <div className="hero-bloop"><Bloop mood="encouraging" size="lg" /><span>We can make today smaller.</span></div>
        </div>
      </section>

      <section id="difference" className="difference-section shell-width">
        <div className="section-kicker">A kinder operating system</div>
        <div className="difference-heading">
          <h2>Most planners organise <span>time.</span><br />MindWeather organises <em>capacity.</em></h2>
          <p>Traditional planners ask, “What needs to get done?” We also ask, “What can your brain realistically handle today?”</p>
        </div>
        <div className="plan-switcher">
          <div className="plan-switcher__tabs" role="tablist" aria-label="Compare planning approaches">
            <button className={!adaptive ? "active" : ""} onClick={() => setAdaptive(false)}>Normal planner</button>
            <button className={adaptive ? "active" : ""} onClick={() => setAdaptive(true)}>MindWeather</button>
          </div>
          <div className="plan-comparison">
            <AnimatePresence mode="wait">
              <motion.div key={adaptive ? "adaptive" : "normal"} className={adaptive ? "plan-sheet plan-sheet--adaptive" : "plan-sheet"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="plan-sheet__head">
                  <span>{adaptive ? "CURRENT WEATHER" : "TUESDAY · PLAN"}</span>
                  <strong>{adaptive ? "Cognitive Storm" : "Four things. Four hours."}</strong>
                </div>
                <div className="plan-sheet__list">
                  {(adaptive ? adaptivePlan : normalPlan).map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p>{adaptive && <i>{index === 1 ? "pause" : "fits"}</i>}</div>)}
                </div>
                <div className="plan-sheet__footer">{adaptive ? <><Bloop mood="happy" size="sm" /><span><strong>Continue, or call it a win?</strong><small>No guilt attached.</small></span></> : <span><strong>Same plan, regardless of the day.</strong><small>Capacity isn’t part of the calculation.</small></span>}</div>
              </motion.div>
            </AnimatePresence>
            <div className="comparison-note">
              <span className="comparison-note__icon"><Brain /></span>
              <h3>A plan that can change its mind</h3>
              <p>Check in with energy, focus, stress, and motivation. Your day becomes a sequence you can enter—not a wall you have to climb.</p>
              <ul><li><Check /> Smaller entry points on hard days</li><li><Check /> Protected focus when momentum arrives</li><li><Check /> Evidence-based observations from your own history</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section id="systems" className="systems-section shell-width">
        <div className="section-kicker">Inside the weather station</div>
        <div className="systems-heading"><h2>Progress has more than one shape.</h2><p>Your tasks, mistakes, concepts, notes, and study patterns become a living map—not a scoreboard.</p></div>
        <div className="systems-grid">
          <article className="system-card system-card--wide"><span className="system-index">01</span><div><Sparkles /><h3>Knowledge constellations</h3><p>Concepts brighten as confidence grows. Connections appear as the picture becomes clearer.</p></div><div className="mini-constellation"><i className="star s1" /><i className="star s2" /><i className="star s3" /><i className="star s4" /><span className="line l1" /><span className="line l2" /><span className="line l3" /></div></article>
          <article className="system-card system-card--garden"><span className="system-index">02</span><Compass /><h3>Mistake Garden</h3><p>Things that taught you something grow from seed to tree as you revisit and apply them.</p><div className="plant-row"><span>·</span><span>♧</span><span>♧</span><span>✿</span><span>♣</span></div></article>
          <article className="system-card system-card--bloop"><span className="system-index">03</span><Bloop mood="thinking" size="lg" /><h3>Teach Bloop</h3><p>Explain it. Get a thoughtful question—not an instant answer.</p><div className="speech-pill">“Wait. What happens before that?”</div></article>
          <article className="system-card"><span className="system-index">04</span><Brain /><h3>Brain Forecast</h3><p>Gentle observations from your own study history. No unsupported claims, no judgment.</p><div className="spark-bars">{[38, 65, 44, 78, 91, 52, 72].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article>
        </div>
      </section>

      <section className="landing-cta shell-width">
        <WeatherBackdrop weather="clear" quiet />
        <Bloop mood="celebrating" size="lg" />
        <div><span>THE PLAN CAN ADAPT</span><h2>You work differently on different days.<br />Your plan can too.</h2><p>Productivity software usually asks people to adapt themselves to a system. MindWeather asks the system to adapt to the person.</p></div>
        <Link href="/station" className="button button--peach">Check your weather <ArrowRight /></Link>
      </section>

      <footer className="landing-footer shell-width"><Brand /><p>Made for real brains on real days.</p><div><Link href="/mobile">Install on iOS or Android</Link><span>Private by default · Stored on this device</span></div></footer>
    </main>
  );
}
