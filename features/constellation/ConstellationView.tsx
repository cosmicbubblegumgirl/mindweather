"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { Concept, ViewId } from "@/lib/types";
import { Check, ChevronRight, Minus, Plus, Search, Sparkles, ZoomIn } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const levels = ["Not started", "Learning", "Practising", "Comfortable", "Mastered"];

export function ConstellationView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, advanceConcept, addConcept } = useMindWeather();
  const [selectedId, setSelectedId] = useState(state.concepts.find((item) => item.id === "async")?.id ?? state.concepts[0]?.id);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(state.subjects[2]?.id ?? state.subjects[0]?.id);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const selected = state.concepts.find((concept) => concept.id === selectedId);
  const edges = useMemo(() => {
    const found = new Set<string>();
    return state.concepts.flatMap((concept) => concept.related.map((other) => {
      const key = [concept.id, other].sort().join("-");
      if (found.has(key)) return null;
      found.add(key);
      const target = state.concepts.find((item) => item.id === other);
      return target ? { source: concept, target } : null;
    })).filter(Boolean) as { source: Concept; target: Concept }[];
  }, [state.concepts]);
  const relatedMistakes = state.mistakes.filter((mistake) => mistake.topic.toLowerCase().includes(selected?.name.toLowerCase() ?? "__none__") || (selected?.id === "async" && mistake.topic.toLowerCase().includes("promise")));

  return <div className="constellation-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Knowledge constellations</span><h1>Your learning has a night sky.</h1><p>Topics brighten as they become more familiar. Connections show where understanding travels.</p></div><button className="button button--ghost" onClick={() => setAdding(true)}><Plus /> Add a concept</button></header>
    <div className="constellation-layout">
      <section className="constellation-canvas panel" onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!drag.current) return; setPan({ x: drag.current.panX + event.clientX - drag.current.x, y: drag.current.panY + event.clientY - drag.current.y }); }} onPointerUp={() => { drag.current = null; setDragging(false); }}>
        <header><div><span className="status-dot" /><small>JAVASCRIPT · {state.concepts.filter((concept) => concept.subjectId === "javascript").length} STARS</small></div><div className="canvas-legend">{levels.slice(1).map((level, index) => <span key={level}><i className={`level--${index + 1}`} />{level}</span>)}</div></header>
        <svg viewBox="0 0 1000 620" role="img" aria-label="Interactive map of connected learning concepts" onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(.72, Math.min(1.65, value + (event.deltaY < 0 ? .08 : -.08)))); }}>
          <defs><radialGradient id="starGlow"><stop stopColor="#fff"/><stop offset=".3" stopColor="#d7d0ff"/><stop offset="1" stopColor="#9c87ff" stopOpacity="0"/></radialGradient></defs>
          <g transform={`translate(${pan.x / 2} ${pan.y / 2}) scale(${zoom})`} style={{ transformOrigin: "500px 310px", transition: dragging ? "none" : "transform .2s ease" }}>
            {edges.map((edge) => <line key={`${edge.source.id}-${edge.target.id}`} x1={edge.source.x * 10} y1={edge.source.y * 6.2} x2={edge.target.x * 10} y2={edge.target.y * 6.2} className={`constellation-line level--${Math.min(edge.source.level, edge.target.level)}`} />)}
            {state.concepts.map((concept) => <g key={concept.id} className={`concept-star concept-star--${concept.level} ${selectedId === concept.id ? "selected" : ""}`} transform={`translate(${concept.x * 10} ${concept.y * 6.2})`} onPointerDown={(event) => event.stopPropagation()} onClick={() => setSelectedId(concept.id)} role="button" tabIndex={0} aria-label={`${concept.name}, ${levels[concept.level]}`}>
              <circle className="concept-star__halo" r={concept.level === 4 ? 31 : 20 + concept.level * 2} />
              <circle className="concept-star__core" r={concept.level === 0 ? 4 : 5 + concept.level * 1.2} />
              <text y={concept.level === 4 ? 48 : 38} textAnchor="middle">{concept.name}</text>
            </g>)}
          </g>
        </svg>
        <div className="canvas-controls"><button onClick={() => setZoom((value) => Math.min(1.65, value + .12))} aria-label="Zoom in"><Plus /></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.max(.72, value - .12))} aria-label="Zoom out"><Minus /></button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} aria-label="Reset view"><ZoomIn /></button></div>
        <footer>Drag to explore · scroll to zoom · select a star to inspect it</footer>
      </section>
      <aside className="concept-panel panel">{selected ? <><header><span className={`concept-level level--${selected.level}`}><Sparkles /></span><div><small>{state.subjects.find((item) => item.id === selected.subjectId)?.name}</small><h2>{selected.name}</h2></div></header><div className="confidence"><span><strong>{selected.confidence}%</strong><small>self-rated confidence</small></span><div><i style={{ width: `${selected.confidence}%` }} /></div><em>{levels[selected.level]}</em></div><p>{selected.notes}</p><section><span>CONNECTED TO</span><div className="related-chips">{selected.related.map((id) => { const concept = state.concepts.find((item) => item.id === id); return concept && <button key={id} onClick={() => setSelectedId(id)}>{concept.name}</button>; })}</div></section><section className="concept-evidence"><span>RECENT EVIDENCE</span><article><Check /><div><strong>{state.sessions.filter((session) => session.subjectId === selected.subjectId).length} related sessions</strong><small>Across practice, reading, and explaining</small></div></article>{relatedMistakes.map((mistake) => <button key={mistake.id} onClick={() => navigate("garden")}><span>♧</span><div><strong>{mistake.topic}</strong><small>A related lesson in the garden</small></div><ChevronRight /></button>)}</section><button className="button button--violet" onClick={() => advanceConcept(selected.id)} disabled={selected.level === 4}>{selected.level === 4 ? "This star is bright" : `Move to ${levels[selected.level + 1]}`} <Sparkles /></button></> : <div className="empty-state"><div><Search /><h3>Choose a star</h3><p>Its notes, history, mistakes, and connections will appear here.</p></div></div>}</aside>
    </div>
    <Modal open={adding} onClose={() => setAdding(false)} title="Add a concept" eyebrow="A new point in the sky"><form className="simple-form" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; addConcept({ name: name.trim(), subjectId, x: 45 + Math.random() * 20, y: 36 + Math.random() * 28, related: selected ? [selected.id] : [], notes: "A new concept waiting for evidence." }); setName(""); setAdding(false); }}><label className="form-field"><span>Concept name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Event loop" /></label><label className="form-field"><span>Subject</span><select className="select" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>{state.subjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}</option>)}</select></label><button className="button button--peach" type="submit">Place the star <Sparkles /></button></form></Modal>
  </div>;
}
