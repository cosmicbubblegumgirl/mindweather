"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
import { ArrowDown, ArrowUp, Check, ChevronRight, Circle, Clock3, FileText, GripVertical, ListTree, Play, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function PlanView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, plan, planDone, completePlanStep, updateAssignmentSection, startSession } = useMindWeather();
  const [tab, setTab] = useState<"today" | "autopsy">("today");
  const [assignmentView, setAssignmentView] = useState<"brief" | "autopsy" | "timeline">("autopsy");
  const assignment = state.assignments[0];
  const completed = planDone.length;

  const start = (taskId: string | undefined, minutes: number) => { startSession(taskId, minutes); navigate("focus"); };
  return <div className="plan-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Adaptive study plan</span><h1>Today, shaped to fit.</h1><p>{WEATHER[state.currentWeather].label} changed the rhythm—not the meaning of your work.</p></div><div className="segmented"><button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>Today</button><button className={tab === "autopsy" ? "active" : ""} onClick={() => setTab("autopsy")}>Assignment Autopsy</button></div></header>

    {tab === "today" ? <div className="plan-layout">
      <section className="today-sequence panel">
        <header><div><span>TODAY’S SEQUENCE</span><h2>{plan.reduce((sum, item) => sum + item.minutes, 0)} minutes that fit this weather</h2></div><div className="sequence-progress"><span style={{ width: `${Math.min(100, (completed / Math.max(1, plan.length)) * 100)}%` }} /></div></header>
        <div className="sequence-list">{plan.map((step, index) => { const done = planDone.includes(step.id); return <motion.article layout key={step.id} className={`${done ? "done" : ""} kind--${step.kind}`}><GripVertical className="sequence-grip" /><button className="sequence-check" onClick={() => !done && completePlanStep(step)} aria-label={done ? `${step.title} completed` : `Complete ${step.title}`}>{done ? <Check /> : <span>{index + 1}</span>}</button><div className="sequence-copy"><span>{step.subject} · {step.kind}</span><h3>{step.title}</h3><p>{step.reason}</p></div><div className="sequence-time"><strong>{step.minutes}</strong><small>min</small></div><button className="sequence-start" onClick={() => start(step.taskId, step.minutes)} disabled={done}><Play /> Start</button></motion.article>; })}</div>
        <footer><Bloop mood={completed === plan.length ? "celebrating" : "encouraging"} size="sm" /><span><strong>{completed === plan.length ? "You can call it a win." : "The plan is a suggestion, not a contract."}</strong><small>{completed === plan.length ? "Everything planned for this weather is complete." : "Reorder, shorten, or stop when you need to."}</small></span></footer>
      </section>
      <aside className="plan-aside plan-aside--simple">
        <section className="plan-weather-note panel"><span className="weather-orb" /><div><small>WHY THIS PLAN?</small><strong>{WEATHER[state.currentWeather].label}</strong><p>{state.currentWeather === "storm" || state.currentWeather === "battery" ? "Short actions, visible pauses, and low switching cost." : "Deeper tasks first, with space to protect momentum."}</p></div></section>
        <button className="overwhelm-panel" onClick={() => navigate("weather")}><Target /><span><strong>I don’t know where to start</strong><small>Collapse everything to one action</small></span><ChevronRight /></button>
      </aside>
    </div> : assignment && <section className="autopsy panel">
      <header className="autopsy__top"><div><span>ASSIGNMENT AUTOPSY</span><h2>{assignment.title}</h2><p>Turn “do the assignment” into parts you can see, move, and finish.</p></div><div className="assignment-deadline"><Clock3 /><span><small>DEADLINE</small><strong>{new Date(assignment.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong></span></div></header>
      <div className="segmented autopsy__tabs"><button className={assignmentView === "brief" ? "active" : ""} onClick={() => setAssignmentView("brief")}><FileText /> Brief</button><button className={assignmentView === "autopsy" ? "active" : ""} onClick={() => setAssignmentView("autopsy")}><ListTree /> Autopsy</button><button className={assignmentView === "timeline" ? "active" : ""} onClick={() => setAssignmentView("timeline")}><Clock3 /> Timeline</button></div>
      {assignmentView === "brief" && <div className="assignment-brief"><span>DESIRED OUTCOME</span><h3>{assignment.outcome}</h3><div><strong>What “done” looks like</strong><ul><li><Check /> Clear design tension</li><li><Check /> Evidence connected to decisions</li><li><Circle /> Clickable prototype included</li><li><Circle /> All links tested</li></ul></div></div>}
      {assignmentView === "autopsy" && <div className="autopsy-sections">{assignment.sections.map((section, index) => <article key={section.id}><GripVertical /><span className="autopsy-number">{String(index + 1).padStart(2, "0")}</span><div><small>ENERGY {section.energy}/5 · {section.estimate} MIN</small><h3>{section.title}</h3><p>{section.description}</p>{section.blockers && <em>Blocker: {section.blockers}</em>}</div><select value={section.status} onChange={(event) => updateAssignmentSection(assignment.id, section.id, { status: event.target.value as typeof section.status })}><option value="not-started">Not started</option><option value="working">Working</option><option value="done">Done</option></select></article>)}</div>}
      {assignmentView === "timeline" && <div className="assignment-timeline">{assignment.sections.map((section, index) => <article key={section.id} className={`status--${section.status}`}><span>{index + 1}</span><div><strong>{section.title}</strong><small>{section.estimate} min · {section.status.replace("-", " ")}</small></div>{index < assignment.sections.length - 1 && <i />}</article>)}</div>}
      <footer className="autopsy__footer"><span><strong>{assignment.sections.filter((section) => section.status === "done").length} of {assignment.sections.length} sections complete</strong><small>The shape can change as you learn more.</small></span><div><button className="icon-button" aria-label="Move selected section up"><ArrowUp /></button><button className="icon-button" aria-label="Move selected section down"><ArrowDown /></button></div></footer>
    </section>}
  </div>;
}
