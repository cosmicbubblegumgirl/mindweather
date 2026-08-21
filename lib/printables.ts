import { localPlanner } from "@/lib/planningEngine";
import type { AppState, StudyTask } from "@/lib/types";
import { WEATHER } from "@/lib/weather";

export interface TimetableBlock {
  task: string;
  subject: string;
  minutes: number;
  note: string;
}

export interface TimetableDay {
  iso: string;
  label: string;
  blocks: TimetableBlock[];
}

const focusByWeather = { clear: 30, breezy: 20, storm: 8, battery: 6, hyperfocus: 45, foggy: 7 } as const;

function subjectName(state: AppState, task: StudyTask) {
  return state.subjects.find((subject) => subject.id === task.subjectId)?.name ?? "General";
}

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export function buildTimetable(state: AppState, start = new Date()): TimetableDay[] {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setHours(12, 0, 0, 0);
    date.setDate(start.getDate() + index);
    return { iso: date.toISOString().slice(0, 10), label: dateLabel(date), blocks: [] as TimetableBlock[] };
  });
  const tasks = state.tasks.filter((task) => task.status !== "done").sort((a, b) => {
    const deadline = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    return deadline || b.priority - a.priority;
  });
  const blockSize = focusByWeather[state.currentWeather];
  const queue = tasks.map((task) => ({ task, remaining: Math.max(blockSize, task.estimatedMinutes - task.actualMinutes) }));
  let dayIndex = 0;
  while (queue.length && dayIndex < days.length * 2) {
    const current = queue[0];
    const block = Math.min(blockSize, current.remaining);
    const day = days[dayIndex % days.length];
    day.blocks.push({
      task: current.task.title,
      subject: subjectName(state, current.task),
      minutes: block,
      note: current.task.subtasks.find((item) => !item.done)?.title ?? "Stop with a clear restart note.",
    });
    current.remaining -= block;
    if (current.remaining <= 0) queue.shift();
    else queue.push(queue.shift()!);
    dayIndex += 1;
  }
  return days;
}

export function buildWorkbook(state: AppState) {
  const plan = localPlanner.createPlan(state, state.currentWeather);
  const active = state.tasks.filter((task) => task.status !== "done");
  const priority = active.sort((a, b) => b.priority - a.priority || new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
  return {
    learner: state.profile.name,
    weather: WEATHER[state.currentWeather].label,
    weatherNote: WEATHER[state.currentWeather].short,
    priority,
    plan: plan.slice(0, 4),
    subjects: state.subjects.map((subject) => subject.name).join(", "),
  };
}
