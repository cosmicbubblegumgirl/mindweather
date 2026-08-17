"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { HighlightColor, NotebookItem, NotebookKind, ReadingMode, SupportMode, ViewId } from "@/lib/types";
import { notebookFileService } from "@/services/notebookFileService";
import { BookOpenText, BrainCircuit, Check, ChevronRight, Download, File, FilePenLine, FileText, FolderOpen, Highlighter, Lightbulb, NotebookPen, Plus, Presentation, Search, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

const shelves: { id: "all" | NotebookKind; label: string; icon: typeof FileText }[] = [
  { id: "all", label: "Everything", icon: FolderOpen },
  { id: "note", label: "Notes", icon: NotebookPen },
  { id: "slides", label: "Presentations", icon: Presentation },
  { id: "homework", label: "Homework", icon: FilePenLine },
  { id: "reading", label: "Readings", icon: BookOpenText },
  { id: "other", label: "Other", icon: File },
];

const stickerOptions = [
  { value: "🧁", label: "Cupcake" },
  { value: "⚡", label: "Energy" },
  { value: "🌈", label: "Rainbow" },
  { value: "👻", label: "Ghost" },
  { value: "⭐", label: "Star" },
  { value: "🧠", label: "Brain" },
  { value: "💡", label: "Idea" },
  { value: "🪴", label: "Growing" },
  { value: "🎧", label: "Headphones" },
  { value: "🦋", label: "Butterfly" },
];

const highlightColors: { id: HighlightColor; label: string }[] = [
  { id: "sun", label: "Sun yellow" },
  { id: "mint", label: "Mint green" },
  { id: "lilac", label: "Lilac" },
  { id: "coral", label: "Coral" },
];

const strategyLibrary: {
  id: string;
  title: string;
  detail: string;
  tips: string[];
  supportMode?: SupportMode;
  readingMode?: ReadingMode;
  action?: string;
}[] = [
  { id: "adhd", title: "ADHD · starting and switching", detail: "Externalise the start so working memory does not have to hold the whole plan.", tips: ["Put only the first two-minute action on screen.", "Use a visible timer and decide the stopping point before starting.", "Keep a parking note for distracting ideas instead of chasing them."], supportMode: "adhd", action: "Use ADHD launchpad" },
  { id: "dyslexia-open", title: "Dyslexia · open-letter reading", detail: "A rounded type style, wider spacing, and shorter line lengths can reduce visual crowding.", tips: ["Read one paragraph at a time with the rest covered.", "Pair text with audio or read it aloud when useful.", "Mark key verbs and names instead of highlighting whole paragraphs."], supportMode: "reading", readingMode: "open-letter", action: "Use open-letter mode" },
  { id: "dyslexia-clear", title: "Dyslexia · hyperlegible reading", detail: "Distinct letter shapes, strong contrast, and generous line spacing support scanning.", tips: ["Break instructions into one action per line.", "Use a ruler, cursor, or reading window to keep your place.", "Summarise each section in your own words before moving on."], supportMode: "reading", readingMode: "hyperlegible", action: "Use hyperlegible mode" },
  { id: "dyscalculia", title: "Dyscalculia · numbers and sequences", detail: "Make quantities concrete and keep each transformation visible.", tips: ["Use colour consistently for units, operations, and answers.", "Write every intermediate step instead of doing it mentally.", "Check an answer with a picture, estimate, or second method."], action: "Keep these tips close" },
  { id: "dyspraxia", title: "Dyspraxia / DCD · planning actions", detail: "Reduce physical and sequencing load before beginning the academic work.", tips: ["Prepare materials in the order you will use them.", "Use checklists with one physical action per line.", "Allow extra transition time and choose keyboard input when handwriting is tiring."], action: "Keep these tips close" },
  { id: "dysgraphia", title: "Dysgraphia · getting ideas onto the page", detail: "Separate thinking from handwriting, spelling, and formatting.", tips: ["Voice-record or dictate the rough version first.", "Plan with keywords, arrows, or movable cards.", "Edit ideas first and presentation details in a separate pass."], action: "Keep these tips close" },
  { id: "auditory", title: "Auditory processing · spoken information", detail: "Give speech a visual home and create time to process it.", tips: ["Ask for written instructions or captions when available.", "Repeat the instruction back in your own words.", "Pause recordings and write one-line summaries before continuing."], action: "Keep these tips close" },
  { id: "memory", title: "Working memory · holding the steps", detail: "Move information out of your head and into a stable, visible sequence.", tips: ["Keep a three-item working list beside the task.", "Finish or park one step before opening another.", "Use retrieval practice in short rounds with immediate feedback."], supportMode: "adhd", action: "Use shorter visible steps" },
  { id: "sensory", title: "Autism / sensory differences · reducing noise", detail: "Make the environment and sequence more predictable without forcing sameness.", tips: ["Preview what will happen, how long it may take, and how to stop.", "Reduce light, sound, notifications, or texture one source at a time.", "Schedule decompression after high-sensory study periods."], supportMode: "sensory", action: "Use sensory calm" },
  { id: "anxiety", title: "Anxiety or OCD · uncertainty and pressure", detail: "Contain the task without turning reassurance or perfection into another demand.", tips: ["Define a good-enough finish before starting.", "Choose one planned check instead of repeated checking.", "Use a pause point that lets you step away without losing your place."], supportMode: "anxiety", action: "Use anxiety-aware pacing" },
  { id: "low-energy", title: "Depression, fatigue, or burnout · low capacity", detail: "Protect continuity with a minimum useful version of the work.", tips: ["Choose the smallest action that keeps the task alive.", "Alternate effort with genuine recovery, food, water, or movement.", "Record what is already done so the next start costs less."], supportMode: "low-energy", action: "Use low-energy pacing" },
];

const textFileExtensions = new Set(["txt", "md", "csv", "json"]);
const maximumFileSize = 25 * 1024 * 1024;

function classifyFile(file: File): NotebookKind {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["ppt", "pptx", "key"].includes(extension)) return "slides";
  if (["pdf", "epub"].includes(extension)) return "reading";
  if (["doc", "docx", "odt", "rtf"].includes(extension)) return "homework";
  if (textFileExtensions.has(extension) || file.type.startsWith("text/")) return "note";
  return "other";
}

function titleFromFile(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function NotebookView({}: { navigate?(view: ViewId): void }) {
  const { state, addNotebookItem, updateNotebookItem, deleteNotebookItem, updatePreferences } = useMindWeather();
  const [section, setSection] = useState<"notebook" | "tips">("notebook");
  const [shelf, setShelf] = useState<"all" | NotebookKind>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const [highlightColor, setHighlightColor] = useState<HighlightColor>("sun");
  const [notice, setNotice] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...state.notebooks]
      .filter((item) => shelf === "all" || item.kind === shelf)
      .filter((item) => !needle || `${item.title} ${item.body} ${item.fileName ?? ""} ${state.subjects.find((subject) => subject.id === item.subjectId)?.name ?? ""}`.toLowerCase().includes(needle))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [query, shelf, state.notebooks, state.subjects]);

  const selected = state.notebooks.find((item) => item.id === activeId) ?? filteredItems[0] ?? state.notebooks[0];

  const makePage = () => {
    const id = addNotebookItem({ title: "Untitled page", kind: "note", subjectId: state.subjects[0]?.id ?? "", body: "", stickers: ["🧁"], highlights: [] });
    setShelf("all");
    setQuery("");
    setActiveId(id);
    setSection("notebook");
    setNotice("A fresh page is ready for your thoughts.");
  };

  const importFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const incoming = Array.from(files);
    const candidates = incoming.filter((file) => file.size <= maximumFileSize);
    const results = await Promise.all(candidates.map(async (file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const canReadText = file.size <= 2 * 1024 * 1024 && (textFileExtensions.has(extension) || file.type.startsWith("text/"));
      const body = canReadText ? await file.text() : `A private copy of ${file.name} is stored with this notebook page. Add summaries, questions, or important reminders here.`;
      const kind = classifyFile(file);
      const id = addNotebookItem({ title: titleFromFile(file.name), kind, subjectId: state.subjects[0]?.id ?? "", body, fileName: file.name, fileType: file.type || "application/octet-stream", fileSize: file.size, stickers: [kind === "slides" ? "🌈" : "⭐"], highlights: [] });
      try {
        await notebookFileService.put(id, file);
        return id;
      } catch {
        deleteNotebookItem(id);
        return "";
      }
    }));
    const importedIds = results.filter(Boolean);
    const imported = importedIds.length;
    const skipped = incoming.length - imported;
    const lastId = importedIds.at(-1) ?? "";
    if (lastId) setActiveId(lastId);
    setShelf("all");
    setQuery("");
    setSection("notebook");
    setNotice(`${imported} ${imported === 1 ? "file" : "files"} tucked into the notebook${skipped ? ` · ${skipped} skipped` : ""}.`);
  };

  const openStoredFile = async (item: NotebookItem) => {
    const file = await notebookFileService.get(item.id);
    if (!file) {
      setNotice("The file copy is not available in this browser, but your page notes are still here.");
      return;
    }
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf" && !file.type.startsWith("text/")) anchor.download = file.name;
    else {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleSticker = (sticker: string) => {
    if (!selected) return;
    const stickers = selected.stickers.includes(sticker) ? selected.stickers.filter((item) => item !== sticker) : [...selected.stickers, sticker].slice(-5);
    updateNotebookItem(selected.id, { stickers });
  };

  const saveHighlight = () => {
    if (!selected || !highlightText.trim()) return;
    updateNotebookItem(selected.id, { highlights: [{ id: crypto.randomUUID(), text: highlightText.trim(), color: highlightColor, createdAt: new Date().toISOString() }, ...selected.highlights] });
    setHighlightText("");
    setNotice("Highlight saved beside the page.");
  };

  return <div className="notebook-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">The Quirky Notebook</span><h1>A place for the useful mess.</h1><p>Keep notes, presentations, homework, highlights, and tiny sparks together without sending the files anywhere.</p></div><div className="notebook-heading-actions"><button className="button button--ghost" onClick={makePage}><Plus /> New page</button><label className="button button--peach notebook-upload"><Upload /> Upload files<input type="file" multiple accept=".pdf,.doc,.docx,.odt,.rtf,.ppt,.pptx,.key,.txt,.md,.csv,.json,.epub,.png,.jpg,.jpeg,.webp" onChange={(event) => { void importFiles(event.target.files); event.target.value = ""; }} /></label></div></header>

    <div className="segmented notebook-tabs" aria-label="Notebook sections"><button className={section === "notebook" ? "active" : ""} onClick={() => setSection("notebook")}><NotebookPen /> Notebook</button><button className={section === "tips" ? "active" : ""} onClick={() => setSection("tips")}><BrainCircuit /> Study tips</button></div>
    {notice && <div className="notebook-notice" role="status"><Sparkles /> <span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

    {section === "notebook" ? <div className="notebook-layout">
      <aside className="notebook-shelves panel"><header><span>SHELVES</span><strong>{state.notebooks.length} kept pieces</strong></header><nav aria-label="Notebook shelves">{shelves.map(({ id, label, icon: Icon }) => <button key={id} className={shelf === id ? "active" : ""} onClick={() => setShelf(id)}><Icon /><span>{label}</span><small>{id === "all" ? state.notebooks.length : state.notebooks.filter((item) => item.kind === id).length}</small></button>)}</nav><p><ShieldCheck /> Files stay in this browser’s private storage.</p></aside>

      <section className="notebook-index panel"><label className="notebook-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages and files…" /></label><div className="notebook-card-list">{filteredItems.map((item) => { const subject = state.subjects.find((subjectItem) => subjectItem.id === item.subjectId); const kind = shelves.find((entry) => entry.id === item.kind); const Icon = kind?.icon ?? File; return <button key={item.id} className={selected?.id === item.id ? "notebook-card active" : "notebook-card"} onClick={() => setActiveId(item.id)}><span className="notebook-card__icon" style={{ "--notebook-color": subject?.color } as React.CSSProperties}><Icon /></span><span className="notebook-card__copy"><small>{kind?.label} · {subject?.name}</small><strong>{item.title}</strong><em>{item.fileName ? `${item.fileName} · ${formatBytes(item.fileSize)}` : item.body || "A blank page waiting for you."}</em><span>{item.stickers.map((sticker, index) => <i key={`${sticker}-${index}`}>{sticker}</i>)}{item.highlights.length ? <b><Highlighter /> {item.highlights.length}</b> : null}</span></span><ChevronRight /></button>; })}{!filteredItems.length && <div className="notebook-empty"><NotebookPen /><strong>No pages on this shelf</strong><small>Try another shelf or make a new page.</small></div>}</div></section>

      <section className="notebook-editor panel">{selected ? <><header><div><span>OPEN PAGE</span><small>Saved automatically · {new Date(selected.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></div><button className="icon-button" onClick={() => setDeleteId(selected.id)} aria-label={`Delete ${selected.title}`}><Trash2 /></button></header><input className="notebook-title" value={selected.title} onChange={(event) => updateNotebookItem(selected.id, { title: event.target.value })} aria-label="Page title" /><div className="notebook-fields"><label className="form-field"><span>Subject</span><select className="select" value={selected.subjectId} onChange={(event) => updateNotebookItem(selected.id, { subjectId: event.target.value })}>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label><label className="form-field"><span>Kind</span><select className="select" value={selected.kind} onChange={(event) => updateNotebookItem(selected.id, { kind: event.target.value as NotebookKind })}>{shelves.filter((entry) => entry.id !== "all").map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></label><label className="form-field"><span>Due date</span><input className="input" type="date" value={selected.dueDate ?? ""} onChange={(event) => updateNotebookItem(selected.id, { dueDate: event.target.value || undefined })} /></label></div>{selected.fileName && <button className="notebook-file" onClick={() => { void openStoredFile(selected); }}><span><FileText /></span><div><strong>{selected.fileName}</strong><small>{selected.fileType} · {formatBytes(selected.fileSize)}</small></div><Download /></button>}<label className="notebook-paper"><span>Page notes</span><textarea value={selected.body} onChange={(event) => updateNotebookItem(selected.id, { body: event.target.value })} placeholder="Capture the useful bits, unfinished thoughts, questions, or next step…" /></label><section className="sticker-tray"><header><span>STICKER POCKET</span><small>Choose up to five</small></header><div>{stickerOptions.map((sticker) => <button key={sticker.value} aria-label={sticker.label} aria-pressed={selected.stickers.includes(sticker.value)} className={selected.stickers.includes(sticker.value) ? "active" : ""} onClick={() => toggleSticker(sticker.value)}>{sticker.value}</button>)}</div></section><section className="highlight-studio"><header><div><span>HIGHLIGHT STUDIO</span><strong>Keep the line that matters.</strong></div><Highlighter /></header><textarea value={highlightText} onChange={(event) => setHighlightText(event.target.value)} placeholder="Paste or type a key sentence from this document…" /><div className="highlight-tools"><div>{highlightColors.map((color) => <button key={color.id} className={`highlight-dot highlight-dot--${color.id} ${highlightColor === color.id ? "active" : ""}`} aria-label={color.label} aria-pressed={highlightColor === color.id} onClick={() => setHighlightColor(color.id)} />)}</div><button className="button button--ghost button--small" onClick={saveHighlight} disabled={!highlightText.trim()}><Highlighter /> Save highlight</button></div><div className="saved-highlights">{selected.highlights.map((highlight) => <article key={highlight.id} className={`saved-highlight saved-highlight--${highlight.color}`}><mark>{highlight.text}</mark><button onClick={() => updateNotebookItem(selected.id, { highlights: selected.highlights.filter((item) => item.id !== highlight.id) })} aria-label="Remove highlight">×</button></article>)}</div></section></> : <div className="notebook-empty notebook-empty--editor"><NotebookPen /><strong>Open a page</strong><small>Its notes, stickers, file, and highlights will appear here.</small></div>}</section>
    </div> : <section className="strategy-library"><header className="panel"><div><span>LEARNING STRATEGY LIBRARY</span><h2>Choose the friction, not a label.</h2><p>Try what helps and ignore what does not. These are study options, not diagnosis or treatment, and no single list can represent every learner.</p></div><Lightbulb /></header><div className="strategy-grid">{strategyLibrary.map((strategy) => <article key={strategy.id} className="strategy-card panel"><header><span><BrainCircuit /></span><div><h3>{strategy.title}</h3><p>{strategy.detail}</p></div></header><ul>{strategy.tips.map((tip) => <li key={tip}><Check /> <span>{tip}</span></li>)}</ul>{strategy.supportMode || strategy.readingMode ? <button className="button button--ghost button--small" onClick={() => { updatePreferences({ ...(strategy.supportMode ? { supportMode: strategy.supportMode } : {}), ...(strategy.readingMode ? { readingMode: strategy.readingMode } : {}) }); setNotice(`${strategy.action ?? "Support"} is now active.`); }}>{strategy.action}<ChevronRight /></button> : <span className="strategy-card__keep">{strategy.action}</span>}</article>)}</div></section>}

    <Modal open={!!deleteId} onClose={() => setDeleteId("")} title="Remove this notebook page?" eyebrow="A deliberate tidy-up"><div className="confirm-action"><p>The page, its saved highlights, and its private file copy will be removed from this browser.</p><div><button className="button button--ghost" onClick={() => setDeleteId("")}>Keep the page</button><button className="button button--danger" onClick={() => { deleteNotebookItem(deleteId); setDeleteId(""); setActiveId(""); setNotice("The page was removed from this notebook."); }}><Trash2 /> Remove page</button></div></div></Modal>
  </div>;
}
