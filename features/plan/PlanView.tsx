"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { SupportMode, TaskType, ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
import { ArrowDown, ArrowUp, CalendarDays, Check, ChevronRight, Circle, Clock3, FileText, GripVertical, ListTree, Play, Plus, ShieldCheck, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface PlanDraft {
  goal: string;
  subjectId: string;
  deadline: string;
  totalMinutes: number;
  sessions: number;
  supportMode: SupportMode;
}

interface PlanPreviewStep {
  title: string;
  detail: string;
  minutes: number;
  type: TaskType;
}

const supportLabels: Record<SupportMode, { label: string; detail: string }> = {
  flexible: { label: "Flexible", detail: "Balanced pacing shaped by today’s weather." },
  adhd: { label: "ADHD launchpad", detail: "Short starts, visible finishes, and low switching cost." },
  anxiety: { label: "Anxiety-aware", detail: "Previewed steps with clear pause points." },
  "low-energy": { label: "Low-energy", detail: "The minimum useful version, with recovery room." },
  "trauma-aware": { label: "Choice-led", detail: "Predictable steps with control and safe exits." },
  sensory: { label: "Sensory calm", detail: "A quieter sequence with fewer transitions." },
  reading: { label: "Reading support", detail: "Short instructions with one action at a time." },
};

const stepTemplates: Omit<PlanPreviewStep, "minutes">[] = [
  { title: "Define the finish line", detail: "Write one sentence that describes what done looks like.", type: "Other" },
  { title: "Gather the useful material", detail: "Open only the notes, brief, and sources needed for this goal.", type: "Research" },
  { title: "Make a rough first pass", detail: "Build an imperfect version before polishing anything.", type: "Build" },
  { title: "Test your understanding", detail: "Explain, practise, or retrieve the important ideas without looking.", type: "Practise" },
  { title: "Repair the unclear parts", detail: "Return only to the gaps the test exposed.", type: "Revise" },
  { title: "Final check and handoff", detail: "Compare with the finish line, check links, and submit or archive.", type: "Other" },
  { title: "Keep a gentle buffer", detail: "Use this block for anything that took longer than expected.", type: "Other" },
  { title: "Leave a note for future you", detail: "Record what worked and the easiest place to restart.", type: "Write" },
];

function buildPlanPreview(draft: PlanDraft): PlanPreviewStep[] {
  const totalMinutes = Math.min(600, Math.max(20, draft.totalMinutes));
  const sessionCount = Math.min(8, Math.max(2, draft.sessions), Math.max(2, Math.floor(totalMinutes / 5)));
  const baseMinutes = Math.floor(totalMinutes / sessionCount);
  const remainder = totalMinutes - baseMinutes * sessionCount;

  return stepTemplates.slice(0, sessionCount).map((step, index) => ({
    ...step,
    title: draft.supportMode === "adhd" && index === 0 ? "Open one file and begin" : step.title,
    detail: draft.supportMode === "reading" ? step.detail.split(".")[0] + "." : step.detail,
    minutes: baseMinutes + (index === sessionCount - 1 ? remainder : 0),
  }));
}

export function PlanView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, plan, planDone, completePlanStep, updateAssignmentSection, startSession, createTask, updatePreferences } = useMindWeather();
  const [tab, setTab] = useState<"today" | "autopsy">("today");
  const [assignmentView, setAssignmentView] = useState<"brief" | "autopsy" | "timeline">("autopsy");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [createdNotice, setCreatedNotice] = useState("");
  const [draft, setDraft] = useState<PlanDraft>({
    goal: "",
    subjectId: state.subjects[0]?.id ?? "",
    deadline: "",
    totalMinutes: 120,
    sessions: 5,
    supportMode: state.preferences.supportMode,
  });

  const assignment = state.assignments[0];
  const completed = planDone.length;
  const preview = useMemo(() => buildPlanPreview(draft), [draft]);
  const activeSupport = supportLabels[state.preferences.supportMode];
  const canCreate = draft.goal.trim().length >= 3 && Boolean(draft.subjectId) && Boolean(draft.deadline);

  const openBuilder = () => {
    setDraft((current) => ({ ...current, subjectId: current.subjectId || state.subjects[0]?.id || "", supportMode: state.preferences.supportMode }));
    setBuilderOpen(true);
  };

  const start = (taskId: string | undefined, minutes: number) => {
    startSession(taskId, minutes);
    navigate("focus");
  };

  const saveStudyPlan = () => {
    if (!canCreate) return;
    const goal = draft.goal.trim();
    const support = supportLabels[draft.supportMode].label;

    preview.forEach((step, index) => {
      createTask({
        title: step.title,
        subjectId: draft.subjectId,
        description: `${step.detail} Part of: ${goal}`,
        deadline: draft.deadline,
        estimatedMinutes: step.minutes,
        priority: index < 2 ? 3 : 2,
        difficulty: index === 2 || index === 3 ? 3 : 2,
        energy: draft.supportMode === "low-energy" ? 2 : index === 2 ? 4 : 3,
        focus: draft.supportMode === "adhd" ? 2 : 3,
        type: step.type,
        status: "planned",
        notes: `Created in Study Plan Studio · ${support} support lens`,
        subtasks: [
          { id: crypto.randomUUID(), title: "Set up the first visible action", done: false },
          { id: crypto.randomUUID(), title: `Complete the ${step.minutes}-minute block`, done: false },
        ],
      });
    });

    updatePreferences({ supportMode: draft.supportMode });
    setCreatedNotice(`${preview.length} study blocks created for “${goal}”.`);
    setBuilderOpen(false);
    setTab("today");
  };

  return <div className="plan-page">
    <header className="view-heading view-heading--row">
      <div><span className="view-heading__eyebrow">Adaptive study plan</span><h1>Today, shaped to fit.</h1><p>{WEATHER[state.currentWeather].label} changed the rhythm—not the meaning of your work.</p></div>
      <div className="plan-heading-actions"><button className="button button--peach" onClick={openBuilder}><Plus /> Create study plan</button><div className="segmented"><button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>Today</button><button className={tab === "autopsy" ? "active" : ""} onClick={() => setTab("autopsy")}>Assignment Autopsy</button></div></div>
    </header>

    {createdNotice ? <div className="plan-created" role="status"><Check /><span>{createdNotice}</span><button onClick={() => setCreatedNotice("")} aria-label="Dismiss plan confirmation">Dismiss</button></div> : null}

    {tab === "today" ? <div className="plan-layout">
      <section className="today-sequence panel">
        <header><div><span>TODAY’S SEQUENCE</span><h2>{plan.reduce((sum, item) => sum + item.minutes, 0)} minutes that fit this weather</h2></div><div className="sequence-progress"><span style={{ width: `${Math.min(100, (completed / Math.max(1, plan.length)) * 100)}%` }} /></div></header>
        <div className="sequence-list">{plan.map((step, index) => {
          const done = planDone.includes(step.id);
          return <motion.article layout key={step.id} className={`${done ? "done" : ""} kind--${step.kind}`}><GripVertical className="sequence-grip" /><button className="sequence-check" onClick={() => !done && completePlanStep(step)} aria-label={done ? `${step.title} completed` : `Complete ${step.title}`}>{done ? <Check /> : <span>{index + 1}</span>}</button><div className="sequence-copy"><span>{step.subject} · {step.kind}</span><h3>{step.title}</h3><p>{step.reason}</p></div><div className="sequence-time"><strong>{step.minutes}</strong><small>min</small></div><button className="sequence-start" onClick={() => start(step.taskId, step.minutes)} disabled={done}><Play /> Start</button></motion.article>;
        })}</div>
        <footer><Bloop mood={completed === plan.length ? "celebrating" : "encouraging"} size="sm" /><span><strong>{completed === plan.length ? "You can call it a win." : "The plan is a suggestion, not a contract."}</strong><small>{completed === plan.length ? "Everything planned for this weather is complete." : "Reorder, shorten, or stop when you need to."}</small></span></footer>
      </section>
      <aside className="plan-aside plan-aside--simple">
        <section className="plan-weather-note panel"><span className="weather-orb" /><div><small>WHY THIS PLAN?</small><strong>{WEATHER[state.currentWeather].label}</strong><p>{state.currentWeather === "storm" || state.currentWeather === "battery" ? "Short actions, visible pauses, and low switching cost." : "Deeper tasks first, with space to protect momentum."}</p></div></section>
        <section className="plan-support-note panel"><Sparkles /><div><small>SUPPORT LENS</small><strong>{activeSupport.label}</strong><p>{activeSupport.detail}</p><button onClick={() => navigate("settings")}>Change in Settings</button></div></section>
        <button className="overwhelm-panel" onClick={() => navigate("weather")}><Target /><span><strong>I don’t know where to start</strong><small>Collapse everything to one action</small></span><ChevronRight /></button>
      </aside>
    </div> : assignment ? <section className="autopsy panel">
      <header className="autopsy__top"><div><span>ASSIGNMENT AUTOPSY</span><h2>{assignment.title}</h2><p>Turn “do the assignment” into parts you can see, move, and finish.</p></div><div className="assignment-deadline"><Clock3 /><span><small>DEADLINE</small><strong>{new Date(assignment.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong></span></div></header>
      <div className="segmented autopsy__tabs"><button className={assignmentView === "brief" ? "active" : ""} onClick={() => setAssignmentView("brief")}><FileText /> Brief</button><button className={assignmentView === "autopsy" ? "active" : ""} onClick={() => setAssignmentView("autopsy")}><ListTree /> Autopsy</button><button className={assignmentView === "timeline" ? "active" : ""} onClick={() => setAssignmentView("timeline")}><Clock3 /> Timeline</button></div>
      {assignmentView === "brief" ? <div className="assignment-brief"><span>DESIRED OUTCOME</span><h3>{assignment.outcome}</h3><div><strong>What “done” looks like</strong><ul><li><Check /> Clear design tension</li><li><Check /> Evidence connected to decisions</li><li><Circle /> Clickable prototype included</li><li><Circle /> All links tested</li></ul></div></div> : null}
      {assignmentView === "autopsy" ? <div className="autopsy-sections">{assignment.sections.map((section, index) => <article key={section.id}><GripVertical /><span className="autopsy-number">{String(index + 1).padStart(2, "0")}</span><div><small>ENERGY {section.energy}/5 · {section.estimate} MIN</small><h3>{section.title}</h3><p>{section.description}</p>{section.blockers ? <em>Blocker: {section.blockers}</em> : null}</div><select value={section.status} onChange={(event) => updateAssignmentSection(assignment.id, section.id, { status: event.target.value as typeof section.status })}><option value="not-started">Not started</option><option value="working">Working</option><option value="done">Done</option></select></article>)}</div> : null}
      {assignmentView === "timeline" ? <div className="assignment-timeline">{assignment.sections.map((section, index) => <article key={section.id} className={`status--${section.status}`}><span>{index + 1}</span><div><strong>{section.title}</strong><small>{section.estimate} min · {section.status.replace("-", " ")}</small></div>{index < assignment.sections.length - 1 ? <i /> : null}</article>)}</div> : null}
      <footer className="autopsy__footer"><span><strong>{assignment.sections.filter((section) => section.status === "done").length} of {assignment.sections.length} sections complete</strong><small>The shape can change as you learn more.</small></span><div><button className="icon-button" aria-label="Move selected section up"><ArrowUp /></button><button className="icon-button" aria-label="Move selected section down"><ArrowDown /></button></div></footer>
    </section> : null}

    <Modal open={builderOpen} onClose={() => setBuilderOpen(false)} title="Study Plan Studio" eyebrow="Turn one goal into a path" size="lg">
      <div className="plan-builder">
        <div className="plan-builder__form">
          <label className="form-field plan-builder__wide"><span>What are you studying for?</span><input className="input" value={draft.goal} onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))} placeholder="Example: Prepare for the research methods test" /></label>
          <label className="form-field"><span>Subject</span><select className="select" value={draft.subjectId} onChange={(event) => setDraft((current) => ({ ...current, subjectId: event.target.value }))}>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          <label className="form-field"><span>Target date</span><input className="input" type="date" value={draft.deadline} onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))} /></label>
          <label className="form-field"><span>Total study time</span><input className="input" type="number" min="20" max="600" step="10" value={draft.totalMinutes} onChange={(event) => setDraft((current) => ({ ...current, totalMinutes: Number(event.target.value) }))} /></label>
          <label className="form-field"><span>Number of blocks</span><input className="input" type="number" min="2" max="8" value={draft.sessions} onChange={(event) => setDraft((current) => ({ ...current, sessions: Number(event.target.value) }))} /></label>
          <label className="form-field plan-builder__wide"><span>Support lens</span><select className="select" value={draft.supportMode} onChange={(event) => setDraft((current) => ({ ...current, supportMode: event.target.value as SupportMode }))}>{Object.entries(supportLabels).map(([id, support]) => <option key={id} value={id}>{support.label} · {support.detail}</option>)}</select></label>
        </div>

        <section className="plan-builder__preview"><header><div><span>LIVE PREVIEW</span><h3>{preview.length} blocks · {preview.reduce((sum, step) => sum + step.minutes, 0)} minutes</h3></div><span className="pill"><ShieldCheck /> Local and editable</span></header><ol>{preview.map((step, index) => <li key={`${step.title}-${index}`}><span>{index + 1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div><em>{step.minutes}m</em></li>)}</ol></section>
        <div className="plan-builder__google"><CalendarDays /><span><strong>Google stays in the loop.</strong><small>Connected Calendar events and Classroom deadlines remain visible beside the study blocks you create.</small></span></div>
        <footer className="plan-builder__actions"><button className="button button--ghost" onClick={() => setBuilderOpen(false)}>Cancel</button><button className="button button--peach" onClick={saveStudyPlan} disabled={!canCreate}><Sparkles /> Create my plan</button></footer>
      </div>
    </Modal>
  </div>;
}
