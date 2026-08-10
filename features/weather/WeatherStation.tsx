"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId, WeatherId } from "@/lib/types";
import { suggestWeather, WEATHER, weatherMessage } from "@/lib/weather";
import { Activity, BatteryLow, Check, ChevronRight, CloudFog, CloudLightning, Focus, HeartPulse, Sun, Wind, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

const weatherIcons = { clear: Sun, breezy: Wind, storm: CloudLightning, battery: BatteryLow, hyperfocus: Zap, foggy: CloudFog };
const sliderLabels = ["Low", "", "Middle", "", "High"];

export function WeatherStation({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, plan, planDone, selectWeather, completePlanStep, startSession } = useMindWeather();
  const [slidersOpen, setSlidersOpen] = useState(false);
  const [sliders, setSliders] = useState({ energy: 3, focus: 3, stress: 3, motivation: 3 });
  const [firstStepOpen, setFirstStepOpen] = useState(false);
  const suggestion = useMemo(() => suggestWeather(sliders), [sliders]);
  const current = WEATHER[state.currentWeather];
  const CurrentIcon = weatherIcons[state.currentWeather];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="weather-page simple-weather-page">
        <header className="view-heading weather-heading">
          <div><span className="view-heading__eyebrow">{greeting}, {state.profile.name}.</span><h1>What kind of brain day<br />are we working with?</h1><p>Choose what feels closest. This is a reflection, not a medical assessment.</p></div>
          <div className={`current-weather-seal current-weather-seal--${state.currentWeather}`}><CurrentIcon /><span><small>RIGHT NOW</small><strong>{current.label}</strong><em>{current.description}</em></span></div>
        </header>

        <section className="weather-selector" aria-label="Choose today’s cognitive weather">
          {(Object.keys(WEATHER) as WeatherId[]).map((id) => {
            const info = WEATHER[id];
            const Icon = weatherIcons[id];
            const active = id === state.currentWeather;
            return <motion.button whileTap={{ scale: .98 }} key={id} className={active ? `weather-choice weather-choice--${id} active` : `weather-choice weather-choice--${id}`} onClick={() => selectWeather(id)} aria-pressed={active}><span className="weather-choice__icon"><Icon />{active && <i><Check /></i>}</span><strong>{info.label}</strong><small>{info.description}</small></motion.button>;
          })}
        </section>

        <div className="weather-tools simple-weather-tools">
          <div className="rescue-shortcuts" aria-label="Quick support tools">
            <button className="anxiety-button anxiety-button--inline" onClick={() => navigate("wellbeing")}><span><HeartPulse /><strong>Anxiety Rescue</strong><small>Breathe, ground, or untangle a thought.</small></span><ChevronRight /></button>
            <button className="anxiety-button anxiety-button--inline" onClick={() => navigate("wellbeing")}><span><Activity /><strong>ADHD Rescue</strong><small>Find one visible step and restart gently.</small></span><ChevronRight /></button>
          </div>
          <button className="sliders-toggle" onClick={() => setSlidersOpen(!slidersOpen)}><span><Focus /><strong>Not sure what to choose?</strong><small>Use four quick signals for a suggestion.</small></span><ChevronRight className={slidersOpen ? "rotated" : ""} /></button>
          <AnimatePresence>{slidersOpen && <motion.div className="signal-sliders panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="signal-sliders__grid">{(Object.keys(sliders) as (keyof typeof sliders)[]).map((key) => <label key={key}><span><strong>{key}</strong><em>{sliderLabels[sliders[key] - 1] || sliders[key]}</em></span><input type="range" min="1" max="5" value={sliders[key]} onChange={(event) => setSliders((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div>
            <div className="signal-suggestion"><span>YOUR SIGNALS SUGGEST</span><strong>{WEATHER[suggestion].label}</strong><button className="button button--violet button--small" onClick={() => { selectWeather(suggestion, sliders); setSlidersOpen(false); }}>Use this weather</button></div>
          </motion.div>}</AnimatePresence>
        </div>

        <section className="adaptive-strip simple-adaptive-strip">
          <div className="adaptive-strip__copy"><span>TODAY’S PACE</span><h2>{weatherMessage[state.currentWeather]}</h2><p>{state.currentWeather === "storm" || state.currentWeather === "battery" ? "Demanding work has been broken into small, visible actions. Nothing disappeared; it just stopped shouting." : "Your plan protects the kind of focus you reported and leaves room to change course."}</p><div><button className="button button--peach" onClick={() => navigate("plan")}>See today’s plan <ChevronRight /></button><button className="overwhelm-button" onClick={() => setFirstStepOpen(true)}>I don’t know where to start</button></div></div>
          <div className="adaptive-preview panel">
            <header><span>Up next</span><small>{plan.reduce((total, step) => total + step.minutes, 0)} minutes planned</small></header>
            {plan.slice(0, 3).map((step, index) => <button key={step.id} className={planDone.includes(step.id) ? "done" : ""} onClick={() => !planDone.includes(step.id) && completePlanStep(step)}><i>{planDone.includes(step.id) ? <Check /> : index + 1}</i><span><strong>{step.title}</strong><small>{step.subject}</small></span><em>{step.minutes}m</em></button>)}
            <footer><Bloop mood={state.currentWeather === "storm" ? "encouraging" : "happy"} size="sm" /><span><strong>One step at a time.</strong><small>You can stop after any step.</small></span></footer>
          </div>
        </section>
      </div>

      <AnimatePresence>{firstStepOpen && <motion.div className="focus-tunnel simple-first-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="focus-tunnel__close icon-button" onClick={() => setFirstStepOpen(false)} aria-label="Close"><X /></button>
        <div className="focus-tunnel__content">
          <Bloop mood="encouraging" size="lg" />
          <span>JUST ONE STEP</span>
          <h2>{plan[0]?.title ?? "Open the task you were avoiding"}</h2>
          <p>Give this {plan[0]?.minutes ?? 8} minutes. You do not need to finish the whole task.</p>
          <button className="button button--peach" onClick={() => { startSession(plan[0]?.taskId, plan[0]?.minutes ?? 8); setFirstStepOpen(false); navigate("focus"); }}>Start this step <ChevronRight /></button>
          <button className="button button--ghost" onClick={() => setFirstStepOpen(false)}>Not right now</button>
        </div>
      </motion.div>}</AnimatePresence>
    </>
  );
}
