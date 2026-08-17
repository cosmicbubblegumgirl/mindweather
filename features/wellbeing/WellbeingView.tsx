"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { SupportMode, ViewId, WellbeingBand, WellbeingKind } from "@/lib/types";
import { Activity, ArrowRight, BatteryLow, BookOpenText, BrainCircuit, Check, CheckCircle2, Eye, HeartPulse, LifeBuoy, ListChecks, MousePointerClick, Pause, Phone, Play, RotateCcw, ShieldCheck, Shuffle, Sparkles, UserRound, VolumeX, Waves, Wind, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const questions = {
  anxiety: [
    "I noticed my body holding tension today.",
    "Worry kept pulling my attention away from what I meant to do.",
    "It was hard to settle even after I had a quiet moment.",
    "I avoided a small task because it felt bigger than it was.",
    "My thoughts kept rehearsing what might go wrong.",
    "I wanted reassurance before taking the next step.",
  ],
  attention: [
    "I found it difficult to start a task, even when it mattered to me.",
    "Small sounds, tabs, or thoughts pulled me away from the work.",
    "I lost track of time while switching between tasks.",
    "I needed a visible first step to get moving.",
    "Long instructions were harder to hold in mind today.",
    "Movement or a change of setting helped me return.",
  ],
} as const;

const answerLabels = ["Not today", "A little", "Often", "A lot"];
const groundingSteps = [
  { number: "5", label: "things you can see", prompt: "Let your eyes land on five colours, edges, or shapes." },
  { number: "4", label: "things you can feel", prompt: "Notice four points of contact: feet, fabric, chair, or air." },
  { number: "3", label: "things you can hear", prompt: "Find three sounds, even if they are very far away." },
  { number: "2", label: "things you can smell", prompt: "Name two scents, or two neutral smells you could find." },
  { number: "1", label: "kind thing to tell yourself", prompt: "Choose one sentence that gives this moment less pressure." },
] as const;
const unhookPrompts = [
  "What is the worry predicting?",
  "What is true in this exact minute?",
  "What would I say to someone I care about?",
] as const;

type ReliefMode = "breathe" | "ground" | "unhook";
type FrictionId = "start" | "choose" | "remember" | "sensory" | "perfect" | "read";

const supportDeck: { id: SupportMode; label: string; detail: string; strategy: string; icon: typeof Activity }[] = [
  { id: "adhd", label: "ADHD launchpad", detail: "When starting and switching feel expensive.", strategy: "Two-minute starts, visible finish lines, and short sprints.", icon: BrainCircuit },
  { id: "anxiety", label: "Anxiety-aware", detail: "When uncertainty makes the task feel unsafe.", strategy: "Preview first, choose a pause point, then begin one contained step.", icon: ShieldCheck },
  { id: "low-energy", label: "Low-energy", detail: "When depression, fatigue, or medication leaves less capacity.", strategy: "Minimum useful work, gentle pacing, and recovery room.", icon: BatteryLow },
  { id: "trauma-aware", label: "Choice-led", detail: "When control and predictability matter most.", strategy: "Clear expectations, opt-out points, and no forced reflection.", icon: UserRound },
  { id: "sensory", label: "Sensory calm", detail: "When noise, light, or transitions compete with learning.", strategy: "Fewer switches, quieter sequences, and planned decompression.", icon: Waves },
  { id: "reading", label: "Reading support", detail: "When dense text is hard to hold or decode.", strategy: "One action per instruction, shorter chunks, and retrieval pauses.", icon: BookOpenText },
];

const frictionDoors: Record<FrictionId, { label: string; action: string; icon: typeof Activity }> = {
  start: { label: "I cannot start", action: "Open the task and work for two minutes. Stopping after two still counts.", icon: MousePointerClick },
  choose: { label: "Too many choices", action: "Choose the task with the nearest deadline. Hide every other task for ten minutes.", icon: Shuffle },
  remember: { label: "I lose the steps", action: "Write the next three actions where you can see them. Cross out, do not erase.", icon: ListChecks },
  sensory: { label: "The room is too loud", action: "Reduce one input, keep one grounding object nearby, and choose a no-switch block.", icon: VolumeX },
  perfect: { label: "It has to be perfect", action: "Make a version that is allowed to be wrong. Your only job is to create something editable.", icon: Sparkles },
  read: { label: "The words will not stick", action: "Read one paragraph, close it, and say one remembered idea out loud or in writing.", icon: Eye },
};

function bandFor(score: number): WellbeingBand {
  if (score <= 7) return "low-signal";
  if (score <= 13) return "worth-noticing";
  return "talk-to-someone";
}

function bandCopy(band: WellbeingBand) {
  if (band === "low-signal") return "Nothing here is asking for a big change. Keep the plan kind and visible.";
  if (band === "worth-noticing") return "This is a useful signal to slow down, reduce switching, and notice what helps.";
  return "It may help to talk with a qualified professional or someone you trust. You deserve support, not a label.";
}

export function WellbeingView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, recordWellbeingCheckin, updatePreferences } = useMindWeather();
  const [kind, setKind] = useState<WellbeingKind | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ kind: WellbeingKind; score: number; band: WellbeingBand } | null>(null);
  const [grounding, setGrounding] = useState(false);
  const [seconds, setSeconds] = useState(90);
  const [helpOpen, setHelpOpen] = useState(false);
  const [reliefMode, setReliefMode] = useState<ReliefMode>("breathe");
  const [reliefRunning, setReliefRunning] = useState(false);
  const [reliefElapsed, setReliefElapsed] = useState(0);
  const [groundStep, setGroundStep] = useState(0);
  const [unhookPrompt, setUnhookPrompt] = useState(0);
  const [unhookText, setUnhookText] = useState("");
  const [unhookSaved, setUnhookSaved] = useState(false);
  const [friction, setFriction] = useState<FrictionId | null>(null);

  useEffect(() => {
    if (!grounding || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [grounding, seconds]);

  useEffect(() => {
    if (!reliefRunning || reliefElapsed >= 60) return;
    const timer = window.setInterval(() => setReliefElapsed((value) => Math.min(60, value + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [reliefElapsed, reliefRunning]);

  const activeQuestions = kind ? questions[kind] : [];
  const score = useMemo(() => answers.reduce((sum, value) => sum + Math.max(0, value), 0), [answers]);
  const answered = answers.length === activeQuestions.length && answers.every((answer) => answer >= 0);
  const breathSecond = reliefElapsed % 10;
  const breathingIn = reliefElapsed < 60 && breathSecond < 4;
  const reliefActive = reliefRunning && reliefElapsed < 60;
  const breathLabel = reliefElapsed >= 60 ? "A little more room" : breathingIn ? "Breathe in" : "Let it out";
  const breathHint = reliefElapsed >= 60 ? "You can stay here, repeat the minute, or choose another small door." : breathingIn ? "A soft four-count in" : "A longer six-count out";
  const startQuickReset = () => {
    setGrounding(true);
    setSeconds(90);
    setReliefMode("breathe");
    setReliefElapsed(0);
    setReliefRunning(true);
  };
  const chooseReliefMode = (nextMode: ReliefMode) => {
    setReliefMode(nextMode);
    setReliefRunning(false);
    setGroundStep(0);
    setUnhookSaved(false);
  };
  const begin = (nextKind: WellbeingKind) => {
    setKind(nextKind);
    setAnswers(Array(questions[nextKind].length).fill(-1));
    setResult(null);
  };
  const finish = () => {
    if (!kind || !answered) return;
    const band = bandFor(score);
    const next = { kind, score, band };
    setResult(next);
    recordWellbeingCheckin(next);
  };

  return (
    <div className="wellbeing-page">
      <header className="view-heading view-heading--row">
        <div>
          <span className="view-heading__eyebrow">Rescue tools</span>
          <h1>Find a little room to begin again.</h1>
          <p>Choose Anxiety Rescue, ADHD Rescue, or talk to a human. These tools support the moment; they do not diagnose you.</p>
        </div>
        <button className="anxiety-button" onClick={startQuickReset}><Wind /> Start Anxiety Rescue</button>
      </header>

      <section className="wellbeing-quick panel">
        <div className="wellbeing-quick__bloop"><Bloop mood={grounding ? "encouraging" : "neutral"} size="lg" /></div>
        <div>
          <span>FIRST, MAKE THIS MOMENT SMALLER</span>
          <h2>{grounding ? seconds ? "Breathe with the weather." : "You made a little room." : "No score required to take care of yourself."}</h2>
          <p>{grounding ? seconds ? "Inhale gently for four. Exhale for six. Let the timer be the only thing you need to follow." : "The next step can be water, a person, or a pause. You do not have to solve everything here." : "Choose a reflection below only if it feels useful. You can leave at any point."}</p>
          {grounding && <div className="grounding-progress"><span style={{ width: `${(seconds / 90) * 100}%` }} /></div>}
          <div className="wellbeing-quick__actions">
            {grounding ? <button className="button button--ghost" onClick={() => setGrounding(false)}>Close reset</button> : <><button className="button button--peach" onClick={startQuickReset}>Start a 90-second reset</button><button className="button button--ghost" onClick={() => setHelpOpen(true)}><LifeBuoy /> Find support</button></>}
          </div>
        </div>
      </section>

      <section className="anxiety-relief panel" aria-labelledby="anxiety-relief-title">
        <header className="anxiety-relief__header">
          <div>
            <span>ANXIETY RESCUE</span>
            <h2 id="anxiety-relief-title">A quiet place to land.</h2>
            <p>Pick one small door. You do not need to understand the whole feeling before you can make it gentler.</p>
          </div>
          <div className="anxiety-relief__privacy"><ShieldCheck /> Saved to your protected account</div>
        </header>
        <div className="relief-tabs" role="tablist" aria-label="Anxiety relief options">
          <button className={reliefMode === "breathe" ? "active" : ""} onClick={() => chooseReliefMode("breathe")} role="tab" aria-selected={reliefMode === "breathe"}><Wind /><span><strong>Settle the body</strong><small>paced breathing</small></span></button>
          <button className={reliefMode === "ground" ? "active" : ""} onClick={() => chooseReliefMode("ground")} role="tab" aria-selected={reliefMode === "ground"}><Eye /><span><strong>Come back here</strong><small>five gentle anchors</small></span></button>
          <button className={reliefMode === "unhook" ? "active" : ""} onClick={() => chooseReliefMode("unhook")} role="tab" aria-selected={reliefMode === "unhook"}><Sparkles /><span><strong>Untangle the thought</strong><small>one honest prompt</small></span></button>
        </div>
        <div className="anxiety-relief__body">
          {reliefMode === "breathe" && <div className="relief-breathe" role="tabpanel">
            <div className="relief-orbit" aria-live="polite"><div className={`relief-orb ${breathingIn ? "is-inhale" : "is-exhale"} ${reliefActive ? "is-moving" : ""}`}><span>{breathLabel}</span><small>{breathHint}</small></div><i /><i /><i /></div>
            <div className="relief-copy"><span className="relief-copy__eyebrow">ONE MINUTE · 4 IN / 6 OUT</span><h3>Let the exhale have a little longer.</h3><p>There is nothing to perform here. Follow the circle if it helps; let your breath find its own comfortable size if it does not.</p><div className="relief-meter"><div><span style={{ width: `${(reliefElapsed / 60) * 100}%` }} /></div><small>{reliefElapsed >= 60 ? "Complete" : `${String(Math.floor(reliefElapsed / 60)).padStart(2, "0")}:${String(reliefElapsed % 60).padStart(2, "0")}`}</small></div><div className="relief-actions"><button className="button button--peach" onClick={() => { if (reliefElapsed >= 60) { setReliefElapsed(0); setReliefRunning(true); } else setReliefRunning((running) => !running); }}>{reliefActive ? <><Pause /> Pause</> : <><Play /> {reliefElapsed >= 60 ? "Breathe again" : "Begin gently"}</>}</button><button className="button button--ghost" onClick={() => { setReliefElapsed(0); setReliefRunning(false); }}><RotateCcw /> Reset</button></div></div>
          </div>}
          {reliefMode === "ground" && <div className="relief-ground" role="tabpanel">
            {groundStep < groundingSteps.length ? <><div className="ground-step-count"><strong>{groundingSteps[groundStep].number}</strong><span>{groundingSteps[groundStep].label}</span></div><h3>{groundingSteps[groundStep].prompt}</h3><p>Take the time you need. The point is noticing, not getting the answer right.</p><div className="ground-step-dots">{groundingSteps.map((step, index) => <i key={step.number} className={index <= groundStep ? "active" : ""} />)}</div><div className="relief-actions"><button className="button button--peach" onClick={() => setGroundStep((step) => Math.min(groundingSteps.length, step + 1))}>{groundStep === groundingSteps.length - 1 ? "Finish the anchors" : "I found one"} <ArrowRight /></button><button className="button button--ghost" onClick={() => setGroundStep(0)}><RotateCcw /> Start over</button></div></> : <div className="ground-complete"><CheckCircle2 /><span>Five anchors found</span><h3>You are here, in this room, in this minute.</h3><p>Keep one detail with you as you return to the next small thing.</p><button className="button button--ghost" onClick={() => setGroundStep(0)}>Try another round</button></div>}
          </div>}
          {reliefMode === "unhook" && <div className="relief-unhook" role="tabpanel"><span className="relief-copy__eyebrow">A SOFTER QUESTION · {unhookPrompt + 1} / {unhookPrompts.length}</span><h3>{unhookPrompts[unhookPrompt]}</h3><textarea value={unhookText} onChange={(event) => { setUnhookText(event.target.value); setUnhookSaved(false); }} placeholder="A few words is enough. You can leave this blank." aria-label={unhookPrompts[unhookPrompt]} /><p>This is a private scratchpad for this moment. It disappears when you leave this screen; copy anything useful into your journal if you want to keep it.</p><div className="relief-actions"><button className="button button--peach" onClick={() => { if (unhookPrompt === unhookPrompts.length - 1) setUnhookSaved(true); else setUnhookPrompt((prompt) => prompt + 1); }}>{unhookPrompt === unhookPrompts.length - 1 ? "That is enough for now" : "Next gentle question"} <ArrowRight /></button><button className="button button--ghost" onClick={() => { setUnhookPrompt(0); setUnhookText(""); setUnhookSaved(false); }}><RotateCcw /> Clear</button></div>{unhookSaved && <div className="unhook-note"><CheckCircle2 /> You made space around the thought. The next step can be very small.</div>}</div>}
        </div>
      </section>

      <section className="support-deck panel" aria-labelledby="support-deck-title">
        <header><div><span>LEARNING SUPPORT DECK</span><h2 id="support-deck-title">Pick scaffolding, not a label.</h2><p>These study lenses can help learners living with ADHD, anxiety, depression, trauma, sensory overload, dyslexia, or processing differences. They are practical preferences—not treatment or diagnosis.</p></div><span className="support-deck__privacy"><ShieldCheck /> Stays on this device</span></header>
        <div className="support-deck__grid">{supportDeck.map(({ id, label, detail, strategy, icon: Icon }) => <button key={id} aria-pressed={state.preferences.supportMode === id} className={state.preferences.supportMode === id ? "support-card active" : "support-card"} onClick={() => updatePreferences({ supportMode: id })}><span><Icon /></span><div><strong>{label}</strong><small>{detail}</small><p>{strategy}</p></div>{state.preferences.supportMode === id ? <CheckCircle2 /> : <ArrowRight />}</button>)}</div>
      </section>

      <section className="friction-finder panel" aria-labelledby="friction-finder-title">
        <div className="friction-finder__intro"><span>FRICTION FINDER</span><h2 id="friction-finder-title">What is making the doorway sticky?</h2><p>Choose the problem in front of you. MindWeather will translate it into one concrete door.</p></div>
        <div className="friction-finder__choices">{Object.entries(frictionDoors).map(([id, item]) => { const Icon = item.icon; return <button key={id} className={friction === id ? "active" : ""} onClick={() => setFriction(id as FrictionId)}><Icon />{item.label}</button>; })}</div>
        <div className={friction ? "friction-door is-open" : "friction-door"} aria-live="polite">{friction ? <><span><Sparkles /></span><div><small>YOUR NEXT DOOR</small><strong>{frictionDoors[friction].action}</strong></div><button className="button button--ghost" onClick={() => navigate("plan")}>Shape the plan <ArrowRight /></button></> : <p>Choose one kind of friction to reveal a next step.</p>}</div>
      </section>

      <div className="wellbeing-test-grid">
        <article className="wellbeing-test panel"><span className="wellbeing-test__icon"><HeartPulse /></span><div><span>ANXIETY RESCUE</span><h2>How loud is the worry today?</h2><p>Six gentle prompts about this moment, not who you are.</p><button className="button button--violet" onClick={() => begin("anxiety")}>Check the anxiety signal <ArrowRight /></button></div></article>
        <article className="wellbeing-test panel"><span className="wellbeing-test__icon"><Activity /></span><div><span>ADHD RESCUE</span><h2>What will help your focus return?</h2><p>Notice what is blocking the start, then return to one visible step.</p><button className="button button--violet" onClick={() => begin("attention")}>Start ADHD Rescue <ArrowRight /></button></div></article>
      </div>

      <section className="wellbeing-help panel"><div><span>SUPPORT IS PART OF THE PLAN</span><h2>You can ask for a human.</h2><p>MindWeather is a study tool. If anxiety or attention difficulties are affecting your safety, relationships, sleep, or daily life, a qualified professional can help you understand what is going on.</p></div><button className="button button--ghost" onClick={() => setHelpOpen(true)}><Phone /> View help lines</button></section>
      {state.wellbeingCheckins.length > 0 && <p className="wellbeing-history"><ShieldCheck /> {state.wellbeingCheckins.length} private check-ins saved to your account.</p>}

      <Modal open={!!kind} onClose={() => setKind(null)} title={kind === "anxiety" ? "Anxiety reflection" : "Attention reflection"} eyebrow="No diagnosis here" size="lg">
        {kind && !result && <div className="wellbeing-form"><p>Choose the answer that fits the last two weeks loosely. Skip anything that does not feel like you.</p>{activeQuestions.map((question, index) => <label key={question}><span>{index + 1}. {question}</span><div className="wellbeing-options">{answerLabels.map((label, value) => <button key={label} className={answers[index] === value ? "active" : ""} onClick={() => setAnswers((items) => items.map((item, itemIndex) => itemIndex === index ? value : item))}>{label}</button>)}</div></label>)}<button className="button button--peach" onClick={finish} disabled={!answered}>See my signal <Check /></button></div>}
        {result && <div className="wellbeing-result"><Bloop mood={result.band === "talk-to-someone" ? "encouraging" : "happy"} size="lg" /><span>{result.kind === "anxiety" ? "ANXIETY REFLECTION" : "ATTENTION REFLECTION"}</span><h2>{result.band === "talk-to-someone" ? "Worth talking through." : result.band === "worth-noticing" ? "A signal worth noticing." : "A quieter signal today."}</h2><p>{bandCopy(result.band)}</p><small>Score {result.score}/18 · stored privately in your account</small><div><button className="button button--ghost" onClick={() => { setKind(null); navigate("plan"); }}>Shape today&apos;s plan</button><button className="button button--peach" onClick={() => setKind(null)}>Close reflection</button></div></div>}
      </Modal>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help lines and support" eyebrow="You deserve a human voice" size="lg"><div className="help-modal"><p>If you are in immediate danger, call your local emergency services now. If you can, move near another person and tell them plainly that you need support.</p><section><h3>South Africa</h3><a href="tel:0800567567"><Phone /> SADAG Suicide Crisis Line · 0800 567 567 · 24/7</a><a href="tel:0800456789"><Phone /> Cipla Mental Health Helpline · 0800 456 789 · 24/7</a><a href="tel:0112344837"><Phone /> SADAG Mental Health Line · 011 234 4837</a><a href="https://www.health.gov.za/mental-health/" target="_blank" rel="noreferrer"><ShieldCheck /> National Department of Health resources</a></section><section><h3>International</h3><a href="https://findahelpline.com/" target="_blank" rel="noreferrer"><LifeBuoy /> Find a local crisis line by country</a><a href="https://www.who.int/news-room/questions-and-answers/item/suicide" target="_blank" rel="noreferrer"><ShieldCheck /> WHO guidance for immediate support</a></section><button className="button button--ghost" onClick={() => setHelpOpen(false)}><X /> Close</button></div></Modal>
    </div>
  );
}
