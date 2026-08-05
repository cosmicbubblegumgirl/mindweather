"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { BookHeart, Check, ChevronDown, Feather, Plus, Quote, Tag } from "lucide-react";
import { useState } from "react";

const prompts = ["What clicked today?", "What confused you?", "What took more energy than expected?", "What would make tomorrow easier?", "What did you finish that you almost avoided?"];

export function JournalView({}: { navigate?(view: ViewId): void }) {
  const { state, addJournalEntry } = useMindWeather();
  const [adding, setAdding] = useState(false);
  const [prompt, setPrompt] = useState(prompts[0]);
  const [text, setText] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [tags, setTags] = useState("");
  return <div className="journal-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Reflection journal</span><h1>Notice what changed.</h1><p>A few honest lines are enough. This isn’t another thing to perfect.</p></div><button className="button button--peach" onClick={() => setAdding(true)}><Plus /> New reflection</button></header>
    <section className="journal-prompt panel"><Feather /><div><span>A PROMPT FOR THIS WEATHER</span><h2>{state.currentWeather === "storm" ? "What would make the next hour feel lighter?" : state.currentWeather === "battery" ? "What took more energy than expected?" : "What clicked today?"}</h2><p>You can answer in one sentence. You can also skip it.</p></div><button className="button button--ghost" onClick={() => { setPrompt(state.currentWeather === "storm" ? "What would make the next hour feel lighter?" : state.currentWeather === "battery" ? "What took more energy than expected?" : "What clicked today?"); setAdding(true); }}>Write a little</button></section>
    <div className="journal-layout"><section className="journal-entries">{state.journal.map((entry) => <article key={entry.id} className="journal-entry panel"><header><span className="weather-orb" /><div><strong>{entry.prompt}</strong><small>{new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</small></div><Quote /></header><p>{entry.text}</p><footer>{entry.subjectId && <span style={{ "--tag": state.subjects.find((item) => item.id === entry.subjectId)?.color } as React.CSSProperties}>{state.subjects.find((item) => item.id === entry.subjectId)?.name}</span>}{entry.tags.map((tag) => <em key={tag}>#{tag}</em>)}</footer></article>)}</section><aside className="journal-side panel"><BookHeart /><h3>A small record of real days.</h3><p>Your journal stays private on this device and helps only with your own observations.</p><div><strong>{state.journal.length}</strong><span>reflections</span></div><div><strong>{new Set(state.journal.flatMap((entry) => entry.tags)).size}</strong><span>themes noticed</span></div></aside></div>
    <Modal open={adding} onClose={() => setAdding(false)} title="A quick reflection" eyebrow="No perfect answer needed" size="lg"><form className="journal-form" onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; addJournalEntry({ prompt, text: text.trim(), weather: state.currentWeather, subjectId: subjectId || undefined, tags: tags.split(",").map((item) => item.trim()).filter(Boolean) }); setText(""); setTags(""); setAdding(false); }}><label className="form-field journal-form__wide"><span>Prompt</span><div className="select-wrap"><select className="select" value={prompt} onChange={(event) => setPrompt(event.target.value)}>{[prompt, ...prompts.filter((item) => item !== prompt)].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></div></label><label className="form-field journal-form__wide"><span>Your reflection</span><textarea className="textarea journal-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder="A sentence is enough…" required /></label><label className="form-field"><span>Subject (optional)</span><select className="select" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">No subject</option>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label className="form-field"><span>Tags, comma separated</span><div className="input-with-icon"><Tag /><input className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="frontend, insight" /></div></label><button className="button button--peach journal-form__wide" type="submit">Save reflection <Check /></button></form></Modal>
  </div>;
}
