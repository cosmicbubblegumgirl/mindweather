"use client";

import { useMindWeather } from "@/hooks/useMindWeather";
import { buildTimetable, buildWorkbook } from "@/lib/printables";
import type { ViewId } from "@/lib/types";
import { BookOpenCheck, Brain, CalendarRange, CheckSquare, CloudSun, FileDown, Lightbulb, ListChecks, Printer, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type PrintableKind = "timetable" | "workbook";

export function PrintableStudio({}: { navigate?(view: ViewId): void }) {
  const { state } = useMindWeather();
  const [kind, setKind] = useState<PrintableKind>("timetable");
  const timetable = useMemo(() => buildTimetable(state), [state]);
  const workbook = useMemo(() => buildWorkbook(state), [state]);

  return <div className="printable-studio">
    <header className="view-heading view-heading--row printable-heading"><div><span className="view-heading__eyebrow">Printable Studio</span><h1>Turn today&apos;s weather into paper.</h1><p>Your timetable and workbook are generated in this browser from your current MindWeather data.</p></div><button className="button button--peach" onClick={() => window.print()}><Printer /> Print or save as PDF</button></header>
    <div className="printable-picker panel"><button className={kind === "timetable" ? "active" : ""} onClick={() => setKind("timetable")}><CalendarRange /><span><strong>7-day timetable</strong><small>Weather-sized study blocks</small></span></button><button className={kind === "workbook" ? "active" : ""} onClick={() => setKind("workbook")}><BookOpenCheck /><span><strong>Mind Weather workbook</strong><small>Recall, breakdown, brain dump, reflection</small></span></button><p><FileDown /> Your browser&apos;s print window can save either page as a PDF.</p></div>

    <section className={`print-sheet print-sheet--${kind}`} aria-label={kind === "timetable" ? "Printable seven day timetable" : "Printable Mind Weather workbook"}>
      <header className="print-sheet__brand"><div><span>MW</span><strong>MINDWEATHER</strong></div><p>Study for the brain you have today</p></header>
      {kind === "timetable" ? <>
        <div className="print-title"><span><CloudSun /> {workbook.weather}</span><h1>My weather-aware study week</h1><p>Prepared for {workbook.learner} · Blocks are sized for today&apos;s capacity and can be moved without breaking the plan.</p></div>
        <div className="timetable-grid">{timetable.map((day) => <article key={day.iso}><header><strong>{day.label}</strong><small>{day.iso}</small></header>{day.blocks.length ? day.blocks.map((block, index) => <div key={`${block.task}-${index}`}><span><i />{block.subject}</span><strong>{block.task}</strong><small>{block.minutes} min · {block.note}</small></div>) : <p>Recovery, catch-up, or weather watching.</p>}<footer>Weather check: __________________</footer></article>)}</div>
        <aside className="print-note"><Sparkles /><span><strong>Permission slip</strong><p>A moved block is still a plan. A shorter block is still study. Weather stations update their forecast.</p></span></aside>
      </> : <>
        <div className="print-title"><span><Brain /> {workbook.weather}</span><h1>My Mind Weather workbook</h1><p>{workbook.learner} · Today&apos;s note: {workbook.weatherNote}</p></div>
        <div className="workbook-grid">
          <section><header><ListChecks /><span><small>01</small><h2>Shrink the task</h2></span></header><p>Task: <strong>{workbook.priority?.title ?? "Choose one thing worth moving"}</strong></p><ol>{workbook.plan.map((step) => <li key={step.id}><i />{step.title} <small>{step.minutes} min</small></li>)}</ol><label>The smallest visible start:</label><div className="writing-lines" /></section>
          <section><header><Lightbulb /><span><small>02</small><h2>Active recall</h2></span></header><p>Without looking at notes, write what you already know about {workbook.priority?.title ?? "your current topic"}.</p><div className="writing-lines writing-lines--tall" /><label>What needs checking?</label><div className="writing-lines" /></section>
          <section><header><Brain /><span><small>03</small><h2>Brain dump cloud</h2></span></header><p>Put every loose tab here. Circle only what needs action today.</p><div className="writing-lines writing-lines--tall" /><div className="workbook-tags"><span>DO</span><span>LATER</span><span>IDEA</span><span>WORRY</span><span>RANDOM</span></div></section>
          <section><header><CheckSquare /><span><small>04</small><h2>Future-me handoff</h2></span></header><label>What moved?</label><div className="writing-lines" /><label>What helped this weather?</label><div className="writing-lines" /><label>The easiest place to restart:</label><div className="writing-lines" /></section>
        </div>
        <aside className="print-note"><Sparkles /><span><strong>Nothing needs proving here.</strong><p>This workbook is a thinking surface, not a productivity scorecard.</p></span></aside>
      </>}
      <footer className="print-sheet__footer">Generated privately in MindWeather · {new Date().toLocaleDateString()}</footer>
    </section>
  </div>;
}
