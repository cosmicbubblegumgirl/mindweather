"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId, WeatherId } from "@/lib/types";
import { suggestWeather, WEATHER, weatherMessage } from "@/lib/weather";
import { BatteryLow, Check, ChevronRight, CloudFog, CloudLightning, Focus, Sun, Wind, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

const weatherIcons = { clear: Sun, breezy: Wind, storm: CloudLightning, battery: BatteryLow, hyperfocus: Zap, foggy: CloudFog };
const sliderLabels = ["Low", "", "Middle", "", "High"];

export function WeatherStation({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, plan, planDone, selectWeather, completePlanStep, growMistake, advanceConcept } = useMindWeather();
  const [slidersOpen, setSlidersOpen] = useState(false);
  const [sliders, setSliders] = useState({ energy: 3, focus: 3, stress: 3, motivation: 3 });
  const [tunnelOpen, setTunnelOpen] = useState(false);
  const [tunnelPhase, setTunnelPhase] = useState(0);
  const suggestion = useMemo(() => suggestWeather(sliders), [sliders]);
  const current = WEATHER[state.currentWeather];
  const CurrentIcon = weatherIcons[state.currentWeather];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const moveTunnel = () => {
    if (tunnelPhase === 0 && plan[0]) completePlanStep(plan[0]);
    if (tunnelPhase === 1 && state.mistakes[0]) growMistake(state.mistakes[0].id);
    if (tunnelPhase === 2 && state.concepts.find((concept) => concept.id === "async")) advanceConcept("async");
    setTunnelPhase((phase) => Math.min(4, phase + 1));
  };

  return (
    <>
      <div className="weather-page">
        <header className="view-heading weather-heading">
          <div><span className="view-heading__eyebrow">{greeting}, {state.profile.name}.</span><h1>What kind of brain day<br />are we working with?</h1><p>This is a self-reflection tool, not a medical assessment. You know today best.</p></div>
          <div className={`current-weather-seal current-weather-seal--${state.currentWeather}`}><CurrentIcon /><span><small>RIGHT NOW</small><strong>{current.label}</strong><em>{current.description}</em></span></div>
        </header>

        <section className="weather-selector" aria-label="Choose today’s cognitive weather">
          {(Object.keys(WEATHER) as WeatherId[]).map((id) => {
            const info = WEATHER[id]; const Icon = weatherIcons[id]; const active = id === state.currentWeather;
            return <motion.button whileTap={{ scale: .98 }} key={id} className={active ? `weather-choice weather-choice--${id} active` : `weather-choice weather-choice--${id}`} onClick={() => selectWeather(id)} aria-pressed={active}><span className="weather-choice__icon"><Icon />{active && <i><Check /></i>}</span><strong>{info.label}</strong><small>{info.description}</small>{active && <em>Current weather</em>}</motion.button>;
          })}
        </section>

        <div className="weather-tools">
          <button className="anxiety-button anxiety-button--inline" onClick={() => navigate("wellbeing")}><span><Wind /><strong>Feeling anxious?</strong><small>Make this moment smaller first.</small></span><ChevronRight /></button>
          <button className="sliders-toggle" onClick={() => setSlidersOpen(!slidersOpen)}><span><Focus /><strong>Not sure?</strong><small>Use four quick signals and we’ll suggest a weather.</small></span><ChevronRight className={slidersOpen ? "rotated" : ""} /></button>
          <AnimatePresence>{slidersOpen && <motion.div className="signal-sliders panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="signal-sliders__grid">{(Object.keys(sliders) as (keyof typeof sliders)[]).map((key) => <label key={key}><span><strong>{key}</strong><em>{sliderLabels[sliders[key] - 1] || sliders[key]}</em></span><input type="range" min="1" max="5" value={sliders[key]} onChange={(event) => setSliders((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div>
            <div className="signal-suggestion"><span>YOUR SIGNALS SUGGEST</span><strong>{WEATHER[suggestion].label}</strong><button className="button button--violet button--small" onClick={() => { selectWeather(suggestion, sliders); setSlidersOpen(false); }}>Use this weather</button></div>
          </motion.div>}</AnimatePresence>
        </div>

        <section className="adaptive-strip">
          <div className="adaptive-strip__copy"><span>THE STATION ADAPTED</span><h2>{weatherMessage[state.currentWeather]}</h2><p>{state.currentWeather === "storm" || state.currentWeather === "battery" ? "Long, demanding work has been broken into small visible actions. Nothing disappeared; it just stopped shouting." : "Today’s plan protects the kind of focus you reported and leaves room to change course."}</p><div><button className="button button--peach" onClick={() => navigate("plan")}>See today’s plan <ChevronRight /></button><button className="overwhelm-button" onClick={() => { setTunnelPhase(0); setTunnelOpen(true); }}>I don’t know where to start</button></div></div>
          <div className="adaptive-preview panel">
            <header><span>Today, reshaped</span><small>{plan.reduce((total, step) => total + step.minutes, 0)} gentle minutes</small></header>
            {plan.slice(0, 3).map((step, index) => <button key={step.id} className={planDone.includes(step.id) ? "done" : ""} onClick={() => !planDone.includes(step.id) && completePlanStep(step)}><i>{planDone.includes(step.id) ? <Check /> : index + 1}</i><span><strong>{step.title}</strong><small>{step.subject} · {step.reason}</small></span><em>{step.minutes}m</em></button>)}
            <footer><Bloop mood={state.currentWeather === "storm" ? "encouraging" : "happy"} size="sm" /><span><strong>Continue or call it a win?</strong><small>No guilt attached.</small></span></footer>
          </div>
        </section>

        <section className="station-observations">
          <article><span className="station-observations__index">01</span><small>BRAIN FORECAST</small><h3>Your strongest recent focus window was 15:20–16:10.</h3><button onClick={() => navigate("forecast")}>See the observation <ChevronRight /></button></article>
          <article><span className="station-observations__index">02</span><small>A NOTE FROM PAST YOU 👻</small><h3>“{state.ghostNotes[0]?.message ?? "Past you hasn’t left a note here yet."}”</h3><button onClick={() => navigate("notes")}>Open Ghost Notes <ChevronRight /></button></article>
          <article><span className="station-observations__index">03</span><small>MISTAKE GARDEN</small><h3>{state.mistakes.length} things are becoming evidence of growth.</h3><button onClick={() => navigate("garden")}>Walk through the garden <ChevronRight /></button></article>
        </section>
      </div>

      <AnimatePresence>{tunnelOpen && <motion.div className="focus-tunnel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="focus-tunnel__close icon-button" onClick={() => setTunnelOpen(false)} aria-label="Exit one-step mode"><X /></button>
        <div className="focus-tunnel__stars" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div key={tunnelPhase} className="focus-tunnel__content" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {tunnelPhase === 0 && <><Bloop mood="encouraging" size="lg" /><span>ONE TINY ACTION</span><h2>{plan[0]?.title ?? "Open the task you were avoiding"}</h2><p>Settle in for {plan[0]?.minutes ?? 8} minutes. You do not need to finish the whole thing.</p><button className="button button--peach" onClick={moveTunnel}>I did the tiny thing <Check /></button></>}
            {tunnelPhase === 1 && <><div className="tunnel-check"><Check /></div><span>THAT COUNTS</span><h2>The first edge is behind you.</h2><p>One older lesson has resurfaced nearby.</p><button className="button button--ghost" onClick={moveTunnel}>Visit the lesson</button></>}
            {tunnelPhase === 2 && <><div className="tunnel-plant">♧</div><span>MISTAKE GARDEN</span><h2>Promise chains grew a little.</h2><p>You revisited what went wrong. The seed is becoming something useful.</p><button className="button button--ghost" onClick={moveTunnel}>Light the connected concept</button></>}
            {tunnelPhase === 3 && <><div className="tunnel-star">✦</div><span>KNOWLEDGE CONSTELLATION</span><h2>Async just brightened.</h2><p>Not mastered. More familiar. Progress can be precise.</p><button className="button button--ghost" onClick={moveTunnel}>See what the station noticed</button></>}
            {tunnelPhase === 4 && <><Bloop mood="celebrating" size="lg" /><span>BRAIN FORECAST</span><h2>You work differently on different days.<br />Your plan can too.</h2><p>Productivity software usually asks people to adapt themselves to a system. MindWeather asks the system to adapt to the person.</p><button className="button button--peach" onClick={() => { setTunnelOpen(false); navigate("forecast"); }}>Open Brain Forecast</button></>}
          </motion.div>
        </AnimatePresence>
      </motion.div>}</AnimatePresence>
    </>
  );
}
