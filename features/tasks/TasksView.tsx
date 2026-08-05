"use client";

import { Modal } from "@/components/ui/Modal";
import { useMindWeather } from "@/hooks/useMindWeather";
import type { StudyTask, TaskStatus, TaskType, ViewId } from "@/lib/types";
import { BatteryMedium, CalendarClock, Check, ChevronRight, CircleDashed, Clock3, Filter, GripVertical, ListFilter, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const statusInfo: { id: TaskStatus; label: string; note: string }[] = [
  { id: "inbox", label: "Inbox", note: "Not shaped yet" },
  { id: "planned", label: "Planned", note: "Has a place" },
  { id: "working", label: "Working", note: "Currently moving" },
  { id: "blocked", label: "Blocked", note: "Needs a change" },
  { id: "done", label: "Done", note: "Still counts" },
];
const taskTypes: TaskType[] = ["Read", "Research", "Build", "Practise", "Revise", "Write", "Memorise", "Watch", "Discuss", "Other"];
const DEFAULT_DEADLINE = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
const taskSchema = z.object({ title: z.string().trim().min(2, "Give the task a useful name."), subjectId: z.string().min(1), description: z.string(), deadline: z.string().min(1, "Choose a deadline."), estimatedMinutes: z.coerce.number().min(5).max(480), priority: z.coerce.number().min(1).max(3), difficulty: z.coerce.number().min(1).max(5), energy: z.coerce.number().min(1).max(5), focus: z.coerce.number().min(1).max(5), type: z.enum(taskTypes), status: z.enum(["inbox", "planned", "working", "blocked", "done"]), notes: z.string() });
type TaskForm = z.infer<typeof taskSchema>;

export function TasksView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, createTask, updateTask, deleteTask, startSession } = useMindWeather();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [weatherOnly, setWeatherOnly] = useState(false);
  const [formError, setFormError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskForm>({ defaultValues: { title: "", subjectId: state.subjects[0]?.id, description: "", deadline: DEFAULT_DEADLINE, estimatedMinutes: 25, priority: 2, difficulty: 3, energy: 3, focus: 3, type: "Practise", status: "inbox", notes: "" } });
  const selected = state.tasks.find((task) => task.id === selectedId);
  const filtered = useMemo(() => state.tasks.filter((task) => {
    const matchQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
    const matchSubject = subjectFilter === "all" || task.subjectId === subjectFilter;
    const maxEnergy = state.currentWeather === "storm" || state.currentWeather === "battery" ? 2 : state.currentWeather === "foggy" ? 3 : 5;
    return matchQuery && matchSubject && (!weatherOnly || task.energy <= maxEnergy);
  }), [state.tasks, state.currentWeather, query, subjectFilter, weatherOnly]);

  const submit = (raw: TaskForm) => {
    const parsed = taskSchema.safeParse(raw);
    if (!parsed.success) { setFormError(parsed.error.issues[0]?.message ?? "Please check the task details."); return; }
    createTask({ ...parsed.data, deadline: new Date(parsed.data.deadline).toISOString(), priority: parsed.data.priority as 1 | 2 | 3, difficulty: parsed.data.difficulty as 1 | 2 | 3 | 4 | 5, energy: parsed.data.energy as 1 | 2 | 3 | 4 | 5, focus: parsed.data.focus as 1 | 2 | 3 | 4 | 5 });
    reset(); setFormError(""); setCreateOpen(false);
  };

  return <div className="tasks-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Task weather map</span><h1>Things that are hanging around.</h1><p>Make work visible without making it louder.</p></div><button className="button button--peach" onClick={() => setCreateOpen(true)}><Plus /> New task</button></header>
    <div className="task-toolbar panel"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a task…" />{query && <button onClick={() => setQuery("")}><X /></button>}</label><div><ListFilter /><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><button className={weatherOnly ? "active" : ""} onClick={() => setWeatherOnly(!weatherOnly)}><Filter /> Fits this weather</button><span>{filtered.length} visible</span></div>
    <div className="task-board">{statusInfo.map((column) => { const tasks = filtered.filter((task) => task.status === column.id); return <section key={column.id} className={`task-column task-column--${column.id}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/task-id"); if (id) updateTask(id, { status: column.id, completedAt: column.id === "done" ? new Date().toISOString() : undefined }); }}><header><div><span className="column-dot" /><strong>{column.label}</strong><small>{column.note}</small></div><em>{tasks.length}</em></header><div className="task-column__body">{tasks.map((task) => <TaskCard key={task.id} task={task} subject={state.subjects.find((item) => item.id === task.subjectId)} onOpen={() => setSelectedId(task.id)} />)}{!tasks.length && <div className="task-column__empty"><CircleDashed /><span>Nothing here.<br />That’s allowed.</span></div>}</div></section>; })}</div>

    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a task" eyebrow="Give it a useful shape" size="lg"><form className="task-form" onSubmit={handleSubmit(submit)}><div className="form-field task-form__wide"><label>Task title</label><input className="input" {...register("title")} placeholder="e.g. Trace one rejected promise" />{errors.title && <span className="form-error">{errors.title.message}</span>}</div><div className="form-field"><label>Subject</label><select className="select" {...register("subjectId")}>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><div className="form-field"><label>Type</label><select className="select" {...register("type")}>{taskTypes.map((type) => <option key={type}>{type}</option>)}</select></div><div className="form-field task-form__wide"><label>Description</label><textarea className="textarea" {...register("description")} placeholder="What does a useful finish look like?" /></div><div className="form-field"><label>Deadline</label><input className="input" type="datetime-local" {...register("deadline")} /></div><div className="form-field"><label>Estimated minutes</label><input className="input" type="number" min="5" step="5" {...register("estimatedMinutes")} /></div><div className="form-field"><label>Priority (1–3)</label><input className="input" type="number" min="1" max="3" {...register("priority")} /></div><div className="form-field"><label>Difficulty (1–5)</label><input className="input" type="number" min="1" max="5" {...register("difficulty")} /></div><div className="form-field"><label>Energy needed (1–5)</label><input className="input" type="number" min="1" max="5" {...register("energy")} /></div><div className="form-field"><label>Focus needed (1–5)</label><input className="input" type="number" min="1" max="5" {...register("focus")} /></div><div className="form-field task-form__wide"><label>Notes</label><textarea className="textarea" {...register("notes")} placeholder="Leave yourself an entry point." /></div>{formError && <p className="form-error task-form__wide">{formError}</p>}<div className="task-form__actions task-form__wide"><button type="button" className="button button--ghost" onClick={() => setCreateOpen(false)}>Cancel</button><button className="button button--peach" type="submit">Save task <Check /></button></div></form></Modal>

    <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.title ?? "Task"} eyebrow={selected ? state.subjects.find((subject) => subject.id === selected.subjectId)?.name : undefined} size="lg">{selected && <div className="task-detail"><div className="task-detail__meta"><span><CalendarClock /> {new Date(selected.deadline).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span><span><Clock3 /> {selected.actualMinutes}/{selected.estimatedMinutes} min</span><span><BatteryMedium /> Energy {selected.energy}/5</span></div><p>{selected.description || "No description yet."}</p><div className="task-detail__status"><label>Status<select value={selected.status} onChange={(event) => updateTask(selected.id, { status: event.target.value as TaskStatus })}>{statusInfo.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Priority<select value={selected.priority} onChange={(event) => updateTask(selected.id, { priority: Number(event.target.value) as 1 | 2 | 3 })}><option value="1">Low</option><option value="2">Medium</option><option value="3">High</option></select></label></div><section><span>SUBTASKS</span>{selected.subtasks.length ? selected.subtasks.map((subtask) => <button key={subtask.id} className={subtask.done ? "done" : ""} onClick={() => updateTask(selected.id, { subtasks: selected.subtasks.map((item) => item.id === subtask.id ? { ...item, done: !item.done } : item) })}><i>{subtask.done && <Check />}</i>{subtask.title}</button>) : <small>No subtasks. This one may already be small enough.</small>}</section><blockquote>{selected.notes || "No note from past you yet."}</blockquote><div className="task-detail__actions"><button className="button button--danger" onClick={() => { deleteTask(selected.id); setSelectedId(null); }}><Trash2 /> Delete</button><button className="button button--peach" onClick={() => { startSession(selected.id); navigate("focus"); setSelectedId(null); }}>Start a session <ChevronRight /></button></div></div>}</Modal>
  </div>;
}

function TaskCard({ task, subject, onOpen }: { task: StudyTask; subject?: { name: string; color: string }; onOpen(): void }) {
  const [now] = useState(() => Date.now());
  const days = Math.ceil((new Date(task.deadline).getTime() - now) / 86400000);
  return <article draggable onDragStart={(event) => { event.dataTransfer.setData("text/task-id", task.id); event.dataTransfer.effectAllowed = "move"; }} onClick={onOpen} className="task-card"><div className="task-card__top"><GripVertical /><span style={{ "--subject": subject?.color } as React.CSSProperties}>{subject?.name}</span><em className={`priority--${task.priority}`}>{task.priority === 3 ? "High" : task.priority === 2 ? "Med" : "Low"}</em></div><h3>{task.title}</h3><p>{task.description}</p><div className="task-card__progress"><span style={{ width: `${Math.min(100, task.estimatedMinutes ? task.actualMinutes / task.estimatedMinutes * 100 : 0)}%` }} /></div><footer><span className={days < 0 ? "overdue" : ""}>{days < 0 ? "Wandered past deadline" : days === 0 ? "Today" : `${days}d left`}</span><span>{task.estimatedMinutes}m · E{task.energy}</span><ChevronRight /></footer></article>;
}
