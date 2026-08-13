"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Brand } from "@/components/brand/Brand";
import { WeatherBackdrop } from "@/components/brand/WeatherBackdrop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { Preferences } from "@/lib/types";
import { ArrowLeft, ArrowRight, Check, Headphones, Lightbulb, MessageCircle, MousePointer2, Play, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const obstacleOptions = ["Getting started", "Distractions", "Overwhelm", "Time management", "Remembering information", "Planning", "Motivation", "Understanding difficult concepts"];
const methods = ["Visual", "Reading", "Listening", "Practising", "Explaining", "Mixed"];
const focusTimes = ["Early morning", "Morning", "Afternoon", "Evening", "It varies"];
const supportOptions: { label: string; value: Preferences["overwhelmAction"] }[] = [{ label: "Simplify everything", value: "simplify" }, { label: "Show one task", value: "one-task" }, { label: "Suggest a break", value: "break" }, { label: "Help me prioritise", value: "prioritise" }, { label: "Ask me what I need", value: "ask" }];

export function OnboardingPage() {
  const router = useRouter();
  const { state, updateProfile, updatePreferences, updateSubjects } = useMindWeather();
  const [step, setStep] = useState(0);
  const [field, setField] = useState(state.profile.field || "");
  const [subjects, setSubjects] = useState(state.subjects.slice(0, 3).map((item) => item.name).join(", "));
  const [focusWindow, setFocusWindow] = useState(state.profile.focusWindow || "Afternoon");
  const [obstacles, setObstacles] = useState<string[]>(state.profile.obstacles ?? []);
  const [learning, setLearning] = useState<string[]>(state.profile.learningMethods ?? []);
  const [support, setSupport] = useState<Preferences["overwhelmAction"]>(state.preferences.overwhelmAction);
  const finish = () => {
    updateProfile({ field, focusWindow, obstacles, learningMethods: learning, onboarded: true });
    updatePreferences({ overwhelmAction: support });
    const subjectNames = subjects.split(",").map((item) => item.trim()).filter(Boolean);
    if (subjectNames.length) updateSubjects(subjectNames);
    router.push("/station");
  };
  const canContinue = step === 0 ? field.trim().length > 1 : step === 1 ? subjects.trim().length > 1 : step === 3 ? obstacles.length > 0 : step === 4 ? learning.length > 0 : true;
  return <main className="onboarding-page"><WeatherBackdrop weather="clear" /><header><Brand /><span>STUDY DNA · {step + 1} OF 7</span><button className="button button--ghost button--small" onClick={() => finish()}>Skip for now</button></header><div className="onboarding-progress"><span style={{ width: `${((step + 1) / 7) * 100}%` }} /></div><section className="onboarding-stage"><aside><Bloop mood={step === 6 ? "celebrating" : step === 3 ? "thinking" : "encouraging"} size="lg" /><p>{["Let’s start with the big picture.", "A rough list is perfect.", "No need to be exact.", "Pick as many as feel familiar.", "You can be more than one kind of learner.", "This helps on difficult days.", "That’s enough to begin."][step]}</p></aside><AnimatePresence mode="wait"><motion.div key={step} className="onboarding-card panel" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {step === 0 && <><span>HELLO, {state.profile.name.toUpperCase()}</span><h1>What are you studying?</h1><p>Use the language you would use with a friend.</p><input className="onboarding-main-input" autoFocus value={field} onChange={(event) => setField(event.target.value)} placeholder="Interaction design and frontend…" /></>}
      {step === 1 && <><span>THE CURRENT SKY</span><h1>Which subjects or modules are in orbit?</h1><p>Separate them with commas. You can reshape this list later.</p><textarea className="onboarding-main-input" autoFocus value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="UX Design, JavaScript, Research…" /></>}
      {step === 2 && <><span>YOUR BEST WINDOW</span><h1>When do you normally feel most focused?</h1><p>This is a starting hunch, not a permanent rule.</p><div className="choice-grid">{focusTimes.map((item) => <button key={item} className={focusWindow === item ? "active" : ""} onClick={() => setFocusWindow(item)}><span>{item}</span>{focusWindow === item && <Check />}</button>)}</div></>}
      {step === 3 && <><span>WHEN THE WEATHER TURNS</span><h1>What usually gets in your way?</h1><p>Pick everything that feels familiar.</p><div className="choice-grid choice-grid--chips">{obstacleOptions.map((item) => <button key={item} className={obstacles.includes(item) ? "active" : ""} onClick={() => setObstacles((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{item}{obstacles.includes(item) && <Check />}</button>)}</div></>}
      {step === 4 && <><span>HOW IDEAS LAND</span><h1>How do you usually prefer learning?</h1><p>Choose the methods you naturally reach for.</p><div className="method-grid">{methods.map((item, index) => { const Icon = [Sparkles, Lightbulb, Headphones, MousePointer2, MessageCircle, Play][index]; return <button key={item} className={learning.includes(item) ? "active" : ""} onClick={() => setLearning((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}><Icon /><span>{item}</span>{learning.includes(item) && <Check />}</button>; })}</div></>}
      {step === 5 && <><span>OVERWHELM SUPPORT</span><h1>When everything feels like a lot, what should MindWeather do?</h1><p>You can change this in settings whenever the answer changes.</p><div className="support-list">{supportOptions.map((item) => <button key={item.value} className={support === item.value ? "active" : ""} onClick={() => setSupport(item.value)}><i>{support === item.value && <Check />}</i><span>{item.label}</span></button>)}</div></>}
      {step === 6 && <><span>YOUR INITIAL STUDY DNA</span><h1>A first map, held lightly.</h1><p>We’ll treat these as preferences to test—not facts about your brain.</p><div className="onboarding-summary"><article><strong>{focusWindow}</strong><small>starting focus window</small></article><article><strong>{learning.slice(0,2).join(" + ") || "Mixed"}</strong><small>learning methods</small></article><article><strong>{obstacles[0] || "Getting started"}</strong><small>first support signal</small></article><article><strong>{supportOptions.find((item) => item.value === support)?.label}</strong><small>when overwhelm appears</small></article></div></>}
      <footer><button className="onboarding-back" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}><ArrowLeft /> Back</button><button className="button button--peach" disabled={!canContinue} onClick={() => step === 6 ? finish() : setStep((value) => value + 1)}>{step === 6 ? "Enter my weather station" : "Continue"}<ArrowRight /></button></footer>
    </motion.div></AnimatePresence></section></main>;
}
