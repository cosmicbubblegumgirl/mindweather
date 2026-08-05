"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { Check, ChevronRight, Flower2, Plus, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const stages = ["Seed", "Sprout", "Plant", "Flower", "Tree"];

export function GardenView({}: { navigate?(view: ViewId): void }) {
  const { state, addMistake, growMistake } = useMindWeather();
  const [selectedId, setSelectedId] = useState(state.mistakes[0]?.id);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ subjectId: state.subjects[0]?.id ?? "", topic: "", whatWentWrong: "", originalThought: "", correction: "", insight: "" });
  const selected = state.mistakes.find((mistake) => mistake.id === selectedId);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="garden-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Mistake Garden</span><h1>Things that taught me something.</h1><p>A mistake is stored as evidence—not as a mark against you.</p></div><button className="button button--peach" onClick={() => setAdding(true)}><Plus /> Plant a lesson</button></header>
    <section className="garden-scene panel">
      <div className="garden-moon" /><div className="garden-stars" />
      <header><span><Sprout /> YOUR GARDEN</span><small>{state.mistakes.length} lessons · {state.mistakes.filter((item) => item.stage >= 3).length} flowering</small></header>
      <div className="garden-bed">{state.mistakes.map((mistake, index) => <motion.button layout key={mistake.id} className={`garden-plant garden-plant--${mistake.stage} ${selectedId === mistake.id ? "selected" : ""}`} onClick={() => setSelectedId(mistake.id)} style={{ "--garden-x": `${14 + index * (72 / Math.max(1, state.mistakes.length - 1))}%`, "--garden-delay": `${index * -.6}s` } as React.CSSProperties}><span className="plant-canopy"><i /><i /><i /></span><span className="plant-flower">✦</span><span className="plant-stem"><i /><i /></span><span className="plant-seed" /><em>{mistake.topic}</em><small>{stages[mistake.stage]}</small></motion.button>)}</div>
      <div className="garden-ground"><i /><i /><i /><i /><i /></div>
      <footer>{stages.map((stage, index) => <span key={stage}><i className={`stage stage--${index}`} />{stage}</span>)}</footer>
    </section>
    <div className="garden-detail-layout">
      <section className="lesson-card panel">{selected ? <><header><span className={`lesson-stage lesson-stage--${selected.stage}`}>{selected.stage >= 3 ? <Flower2 /> : <Sprout />}</span><div><small>{state.subjects.find((item) => item.id === selected.subjectId)?.name} · {stages[selected.stage]}</small><h2>{selected.topic}</h2></div></header><div className="lesson-flow"><article><span>WHAT WENT WRONG</span><p>{selected.whatWentWrong}</p></article><ChevronRight /><article><span>WHAT I THOUGHT</span><p>{selected.originalThought}</p></article><ChevronRight /><article className="lesson-correction"><span>WHAT’S CORRECT</span><p>{selected.correction}</p></article></div><blockquote><strong>What helped it click</strong>{selected.insight}</blockquote><button className="button button--violet" onClick={() => growMistake(selected.id)} disabled={selected.stage === 4}>{selected.stage === 4 ? "This lesson has deep roots" : `I applied this correctly · grow to ${stages[selected.stage + 1]}`} <Sprout /></button></> : <div className="empty-state"><div><Sprout /><h3>The soil is ready</h3><p>Record a mistake when it teaches you something useful.</p></div></div>}</section>
      <aside className="garden-philosophy panel"><span>NO FAILURE SCORE</span><h3>Growth is quiet evidence.</h3><p>Revisit when it helps. A seed does not owe anyone a flower by Friday.</p><div className="garden-stat"><strong>{state.mistakes.filter((item) => item.stage > 0).length}</strong><small>lessons revisited</small></div><div className="garden-stat"><strong>{state.mistakes.filter((item) => item.stage >= 3).length}</strong><small>lessons understood</small></div></aside>
    </div>
    <Modal open={adding} onClose={() => setAdding(false)} title="Plant a lesson" eyebrow="What taught you something?" size="lg"><form className="mistake-form" onSubmit={(event) => { event.preventDefault(); if (!form.topic.trim() || !form.correction.trim()) return; addMistake(form); setAdding(false); setForm((current) => ({ ...current, topic: "", whatWentWrong: "", originalThought: "", correction: "", insight: "" })); }}><label className="form-field"><span>Subject</span><select className="select" value={form.subjectId} onChange={(event) => update("subjectId", event.target.value)}>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label className="form-field"><span>Topic</span><input className="input" value={form.topic} onChange={(event) => update("topic", event.target.value)} placeholder="e.g. Promise chains" required /></label><label className="form-field"><span>What went wrong?</span><textarea className="textarea" value={form.whatWentWrong} onChange={(event) => update("whatWentWrong", event.target.value)} required /></label><label className="form-field"><span>What did you originally think?</span><textarea className="textarea" value={form.originalThought} onChange={(event) => update("originalThought", event.target.value)} /></label><label className="form-field"><span>What is correct?</span><textarea className="textarea" value={form.correction} onChange={(event) => update("correction", event.target.value)} required /></label><label className="form-field"><span>What helped you understand it?</span><textarea className="textarea" value={form.insight} onChange={(event) => update("insight", event.target.value)} /></label><div className="mistake-form__actions"><button type="button" className="button button--ghost" onClick={() => setAdding(false)}>Leave it for now</button><button className="button button--peach" type="submit">Plant the lesson <Check /></button></div></form></Modal>
  </div>;
}
