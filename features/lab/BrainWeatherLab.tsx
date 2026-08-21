"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import { buildLabRecipe, type WeatherIntent } from "@/lib/brainWeatherLab";
import type { ViewId } from "@/lib/types";
import { suggestWeather, WEATHER } from "@/lib/weather";
import { ArrowRight, BatteryCharging, Brain, Check, Compass, FlaskConical, Gauge, HeartHandshake, Lightbulb, Sparkles, Target, Waves, Zap } from "lucide-react";
import { useMemo, useState } from "react";

const intents: { id: WeatherIntent; label: string; detail: string; icon: typeof Target }[] = [
  { id: "do", label: "Get something done", detail: "Find a realistic win", icon: Target },
  { id: "settle", label: "Settle my brain", detail: "Lower the volume", icon: Waves },
  { id: "channel", label: "Use this energy", detail: "Give it a container", icon: Zap },
  { id: "understand", label: "Figure this out", detail: "Notice the signals", icon: Brain },
  { id: "explore", label: "Explore an idea", detail: "Follow curiosity", icon: Lightbulb },
  { id: "survive", label: "Just get through today", detail: "Make the day smaller", icon: HeartHandshake },
  { id: "unknown", label: "I genuinely don’t know", detail: "Borrow a first step", icon: Compass },
];

export function BrainWeatherLab({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, plan, selectWeather, startSession } = useMindWeather();
  const latest = state.weatherCheckins[0];
  const [signals, setSignals] = useState({ energy: latest?.energy ?? 3, focus: latest?.focus ?? 3, stress: latest?.stress ?? 3, motivation: latest?.motivation ?? 3 });
  const [intent, setIntent] = useState<WeatherIntent>("do");
  const suggestion = useMemo(() => suggestWeather(signals), [signals]);
  const recipe = useMemo(() => buildLabRecipe(suggestion, intent), [intent, suggestion]);
  const weather = WEATHER[suggestion];

  const useRecipe = () => {
    selectWeather(suggestion, signals);
    if (recipe.destination === "focus") startSession(plan[0]?.taskId, recipe.focusMinutes);
    navigate(recipe.destination);
  };

  return <div className="lab-page">
    <header className="view-heading view-heading--row lab-heading">
      <div><span className="view-heading__eyebrow">Brain Weather Lab</span><h1>Your weather is information.<br />What do you need from it?</h1><p>Try a small experiment with today&apos;s capacity. Nothing here diagnoses, scores, or fixes you.</p></div>
      <div className={`lab-weather-badge lab-weather-badge--${suggestion}`}><FlaskConical /><span><small>LIVE FORECAST</small><strong>{weather.label}</strong><em>{weather.short}</em></span></div>
    </header>

    <section className="lab-layout">
      <div className="lab-signals panel">
        <header><span><Gauge /></span><div><small>STEP 1</small><h2>Set the signal dials</h2><p>Approximate is enough.</p></div></header>
        <div className="lab-sliders">
          {(Object.keys(signals) as (keyof typeof signals)[]).map((key) => <label key={key}><span><strong>{key}</strong><em>{signals[key]} / 5</em></span><input type="range" min="1" max="5" value={signals[key]} onChange={(event) => setSignals((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}
        </div>
        <div className="lab-reading"><BatteryCharging /><span><small>THE LAB IS READING</small><strong>{weather.label}</strong><p>{weather.description}</p></span></div>
      </div>

      <div className="lab-intents panel">
        <header><span><Sparkles /></span><div><small>STEP 2</small><h2>Choose what you need</h2><p>The same weather can be used in different ways.</p></div></header>
        <div>{intents.map(({ id, label, detail, icon: Icon }) => <button key={id} className={intent === id ? "active" : ""} aria-pressed={intent === id} onClick={() => setIntent(id)}><span><Icon /></span><div><strong>{label}</strong><small>{detail}</small></div>{intent === id && <Check />}</button>)}</div>
      </div>
    </section>

    <section className="lab-recipe panel">
      <div className="lab-recipe__bloop"><Bloop mood={intent === "settle" || intent === "survive" ? "encouraging" : intent === "unknown" ? "thinking" : "happy"} size="lg" /><small>Bloopy&apos;s lab note</small></div>
      <div className="lab-recipe__copy"><span>YOUR WEATHER RECIPE</span><h2>{recipe.title}</h2><p>{recipe.forecast}</p><ol>{recipe.steps.map((step, index) => <li key={step}><i>{index + 1}</i><span>{step}</span></li>)}</ol></div>
      <aside><small>SUGGESTED CONTAINER</small><strong>{recipe.focusMinutes}<em>min</em></strong><p>A boundary, not a dare.</p><button className="button button--peach" onClick={useRecipe}>{recipe.destinationLabel}<ArrowRight /></button></aside>
    </section>
  </div>;
}
