"use client";

import { useMindWeather } from "@/hooks/useMindWeather";
import { detectStudyPath, rankResources, resourceIntensityLabel, type ResourceFormat } from "@/lib/resourceCompass";
import type { ViewId } from "@/lib/types";
import { ArrowUpRight, BookOpen, Check, Compass, Filter, Gauge, Route, Settings2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const formatLabels: Record<ResourceFormat | "all", string> = {
  all: "Best fit",
  guide: "Guides",
  course: "Courses",
  practice: "Practice",
  reference: "Reference",
  community: "Community",
};

export function ResourceCompass({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state } = useMindWeather();
  const [format, setFormat] = useState<ResourceFormat | "all">("all");
  const path = useMemo(() => detectStudyPath(state), [state]);
  const recommendations = useMemo(() => rankResources(state), [state]);
  const shown = recommendations.filter((resource) => format === "all" || resource.formats.includes(format)).slice(0, 9);
  const activeTasks = state.tasks.filter((task) => task.status !== "done").length;

  return <div className="resource-page">
    <header className="view-heading view-heading--row resource-heading">
      <div><span className="view-heading__eyebrow">Resource Compass</span><h1>Useful trails, not a link avalanche.</h1><p>Resources are ranked on this device from your study path, current work, learning preferences, and today&apos;s weather.</p></div>
      <button className="button button--ghost button--small" onClick={() => navigate("settings")}><Settings2 /> Tune my study field</button>
    </header>

    <section className="resource-route panel">
      <span className="resource-route__icon"><Route /></span>
      <div><small>CURRENT STUDY PATH</small><h2>{path.label}</h2><p>Detected from your study field, subjects, and the language in {activeTasks || "your"} active {activeTasks === 1 ? "task" : "tasks"}. You can change the study field in Settings at any time.</p></div>
      <span className="resource-confidence"><i style={{ width: `${path.confidence}%` }} /><small>{path.confidence}% signal</small></span>
    </section>

    <div className="resource-toolbar">
      <span><Filter /> Show me</span>
      <div className="segmented" aria-label="Filter resources by format">
        {(Object.keys(formatLabels) as (ResourceFormat | "all")[]).map((id) => <button key={id} className={format === id ? "active" : ""} onClick={() => setFormat(id)}>{format === id && <Check />}{formatLabels[id]}</button>)}
      </div>
    </div>

    <section className="resource-grid" aria-live="polite">
      {shown.map((resource, index) => <article className="resource-card panel" key={resource.id}>
        <header><span><Compass /></span><div><small>{index < 3 ? "STRONG MATCH" : resource.provider.toUpperCase()}</small><h2>{resource.title}</h2></div></header>
        <p>{resource.description}</p>
        <div className="resource-card__meta"><span><Gauge />{resourceIntensityLabel(resource.intensity)}</span><span><BookOpen />{resource.formats[0]}</span>{resource.free && <span><Sparkles />Free access</span>}</div>
        <blockquote>{resource.reason}</blockquote>
        <footer><strong>{resource.provider}</strong><a href={resource.url} target="_blank" rel="noreferrer">Open resource <ArrowUpRight /></a></footer>
      </article>)}
    </section>
    {!shown.length && <div className="empty-state"><Compass /><h3>No resources in this format yet.</h3><p>Choose Best fit to return to your weather-aware recommendations.</p></div>}
    <p className="resource-note"><Sparkles /> MindWeather ranks a small curated library. Bloopy can search the wider web when you explicitly ask an online question.</p>
  </div>;
}
