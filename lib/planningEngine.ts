import type { AppState, PlanStep, WeatherId } from "@/lib/types";

export interface TeachingContext {
  subject?: string;
  task?: string;
  weather?: WeatherId;
  previous?: string[];
}

export interface StudyPlanner {
  createPlan(state: AppState, weather: WeatherId): PlanStep[];
  decomposeAssignment(title: string, outcome: string): { title: string; minutes: number; energy: number }[];
  forecast(state: AppState): string[];
  teachReply(input: string, turn: number, context?: TeachingContext): string;
  roulette(state: AppState, availableMinutes: number): string;
}

const limits: Record<WeatherId, { maxStep: number; count: number }> = {
  clear: { maxStep: 30, count: 4 },
  breezy: { maxStep: 20, count: 4 },
  storm: { maxStep: 12, count: 3 },
  battery: { maxStep: 10, count: 3 },
  hyperfocus: { maxStep: 45, count: 3 },
  foggy: { maxStep: 12, count: 3 },
};

export const localPlanner: StudyPlanner = {
  createPlan(state, weather) {
    const { maxStep, count } = limits[weather];
    const open = state.tasks
      .filter((task) => task.status !== "done" && task.status !== "blocked")
      .sort((a, b) => b.priority - a.priority || new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const plan = open.slice(0, count).map((task, index): PlanStep => {
      const subject = state.subjects.find((item) => item.id === task.subjectId)?.name ?? "Study";
      const gentle = weather === "storm" || weather === "battery" || weather === "foggy";
      const nextSubtask = task.subtasks.find((subtask) => !subtask.done);
      return {
        id: `plan-${task.id}-${weather}`,
        taskId: task.id,
        title: gentle && nextSubtask ? nextSubtask.title : task.title,
        subject,
        minutes: Math.min(maxStep, Math.max(5, task.estimatedMinutes - task.actualMinutes)),
        kind: index === 1 && gentle ? "review" : "study",
        reason: gentle ? "Small enough to enter without carrying the whole task" : "Fits your focus and deadline pattern",
        done: false,
      };
    });

    if (weather === "storm" || weather === "battery" || weather === "foggy") {
      plan.splice(1, 0, {
        id: `plan-reset-${weather}`,
        title: weather === "battery" ? "Water + window reset" : "Three-minute reset",
        subject: "Pause",
        minutes: 3,
        kind: "reset",
        reason: "A deliberate gap, not lost time",
        done: false,
      });
    }
    return plan.slice(0, 4);
  },

  decomposeAssignment(title, outcome) {
    const subject = title.trim() || "the assignment";
    return [
      { title: `Define the finished shape of ${subject}`, minutes: 12, energy: 1 },
      { title: "Gather the three strongest source pieces", minutes: 18, energy: 2 },
      { title: "Build a rough first pass", minutes: 30, energy: 4 },
      { title: `Compare the draft with: ${outcome || "the brief"}`, minutes: 15, energy: 3 },
      { title: "Polish the edges and submit", minutes: 20, energy: 2 },
    ];
  },

  forecast(state) {
    const completed = state.sessions.filter((session) => session.completedMinutes >= session.minutes * 0.8);
    const afternoon = completed.filter((session) => new Date(session.completedAt).getHours() >= 14 && new Date(session.completedAt).getHours() < 18);
    const visual = completed.filter((session) => session.method === "visual");
    return [
      afternoon.length ? "Your strongest recent focus window was 15:20-16:10." : "Your focus window is still taking shape.",
      visual.length >= 2 ? "Visual revision has been easier to finish than long reading sessions." : "Short practice sessions are currently your most consistent format.",
      "Long sessions after 19:00 have been shortened more often than afternoon sessions.",
    ];
  },

  teachReply(input, turn, context = {}) {
    const cleaned = input.trim();
    const topic = context.task || context.subject || "this idea";
    const previous = context.previous?.filter(Boolean).slice(-3) ?? [];
    if (!cleaned) return `Give me the smallest version of ${topic} first. I am listening.`;
    const acronym = cleaned.match(/\b[A-Z]{2,}\b/)?.[0];
    if (acronym) return `I heard ${acronym}. What does it do in this example, and what would break if it disappeared?`;
    if (cleaned.length < 28) return `That is a useful label, but not the mechanism yet. What changes first when ${topic} starts working?`;
    if (/\b(because|so that|which means|therefore)\b/i.test(cleaned)) return `You gave me a reason, which is promising. Can you test it with one tiny example that is not ${topic}?`;
    if (/\b(always|never|every|none)\b/i.test(cleaned)) return "That sounds absolute. Can you find one edge case where your explanation needs a small adjustment?";
    if (previous.length > 1 && previous.at(-1)?.toLowerCase() === cleaned.toLowerCase()) return "You are circling the same sentence. Try drawing the sequence as three short steps instead.";
    if (context.weather === "storm" || context.weather === "battery") return "That is enough detail for a lower-energy day. What is the one part you want to remember tomorrow?";
    const prompts = [
      `I think I am following. What has to happen first in ${topic}?`,
      "Could you give me one tiny real-world example?",
      "Where would this explanation stop being true?",
      "If you changed one part, what would happen next?",
      "That is clearer. Can you say the whole idea in one sentence now?",
    ];
    return prompts[turn % prompts.length];
  },

  roulette(state, availableMinutes) {
    const current = state.currentWeather;
    const subject = state.subjects.find((item) => state.tasks.some((task) => task.subjectId === item.id && task.status !== "done"));
    const gentle = current === "storm" || current === "battery" || current === "foggy";
    const actions = gentle
      ? [
          `Open one ${subject?.name ?? "study"} task and name the first visible action`,
          "Review one mistake and write the corrected version once",
          "Teach Bloop one idea for five minutes",
          "Create three tiny flashcards",
        ]
      : [
          `${Math.min(availableMinutes, 18)}-minute ${subject?.name ?? "study"} challenge`,
          "Explain your current topic badly, then repair the explanation",
          "Find one thing you still do not understand and make it specific",
          "Fix one previous mistake without looking at the correction",
        ];
    const index = (state.sessions.length + availableMinutes + state.tasks.filter((task) => task.status === "done").length) % actions.length;
    return actions[index];
  },
};
