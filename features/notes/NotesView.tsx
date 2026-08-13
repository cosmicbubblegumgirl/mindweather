"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { Check, Ghost, MessageSquareQuote, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

export function NotesView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, addGhostNote } = useMindWeather();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? "");
  const [conceptId, setConceptId] = useState("");
  const [message, setMessage] = useState("");
  const notes = useMemo(() => state.ghostNotes.filter((note) => `${note.message} ${state.subjects.find((item) => item.id === note.subjectId)?.name}`.toLowerCase().includes(query.toLowerCase())), [state.ghostNotes, state.subjects, query]);
  return <div className="notes-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Ghost Notes</span><h1>Messages across time.</h1><p>Leave context for the version of you who will need it later.</p></div><button className="button button--peach" onClick={() => setAdding(true)}><Plus /> Leave a note</button></header>
    <section className="ghost-hero panel"><div className="ghost-figure"><Ghost /><i /></div><div><span>A NOTE FROM PAST YOU 👻</span><blockquote>“{state.ghostNotes[0]?.message}”</blockquote><p>Surfaced because Frontend Development appears in today’s plan.</p></div><button className="button button--ghost" onClick={() => navigate("plan")}>See the related plan</button></section>
    <div className="notes-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages from past you…" /></label><span>{notes.length} notes waiting in the right places</span></div>
    <section className="ghost-grid">{notes.map((note, index) => { const subject = state.subjects.find((item) => item.id === note.subjectId); const concept = state.concepts.find((item) => item.id === note.conceptId); const task = state.tasks.find((item) => item.id === note.taskId); return <article key={note.id} className={`ghost-card ghost-card--${index % 3}`}><header><span style={{ "--note-color": subject?.color } as React.CSSProperties}>{subject?.name}</span><Ghost /></header><blockquote>“{note.message}”</blockquote><div>{concept && <span><Sparkles /> {concept.name}</span>}{task && <span><Check /> {task.title}</span>}</div><footer><small>Written {new Date(note.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small>{note.surfacedAt && <em>Resurfaced today</em>}</footer></article>; })}{!notes.length && <div className="empty-state"><div><Ghost /><h3>No note drifted in</h3><p>Try a different phrase or leave a message for future you.</p></div></div>}</section>
    <Modal open={adding} onClose={() => setAdding(false)} title="Leave a Ghost Note" eyebrow="Future you will find this"><form className="simple-form" onSubmit={(event) => { event.preventDefault(); if (!message.trim()) return; addGhostNote({ subjectId, conceptId: conceptId || undefined, message: message.trim() }); setMessage(""); setAdding(false); }}><label className="form-field"><span>Your message</span><textarea className="textarea" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Future me: start with the box model…" required /></label><label className="form-field"><span>Subject</span><select className="select" value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setConceptId(""); }}>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label className="form-field"><span>Related concept (optional)</span><select className="select" value={conceptId} onChange={(event) => setConceptId(event.target.value)}><option value="">No specific concept</option>{state.concepts.filter((concept) => concept.subjectId === subjectId).map((concept) => <option key={concept.id} value={concept.id}>{concept.name}</option>)}</select></label><p className="form-hint"><MessageSquareQuote /> This note stays inside your protected MindWeather account.</p><button className="button button--peach" type="submit">Send it forward <Ghost /></button></form></Modal>
  </div>;
}
