import type { AppState, TaskType, WellbeingBand } from "@/lib/types";

const subjects = ["frontend", "ux", "javascript", "research", "thinking", "experience", "career", "sap"];
const taskTitles = [
  "Sketch the first mobile state", "Name the empty state", "Read one case study", "Trace a promise chain",
  "Rewrite the research question", "Build the loading transition", "Practise array methods", "Compare two onboarding flows",
  "Map a user's first five minutes", "Refine the button labels", "Review the accessibility notes", "Make one rough prototype",
  "Explain the design tension", "Sort three interview moments", "Test the responsive breakpoint", "Write the reflection headline",
];
const taskTypes: TaskType[] = ["Build", "Revise", "Read", "Practise", "Research", "Write"];
const weather = ["clear", "breezy", "storm", "battery", "hyperfocus", "foggy"] as const;
const methods = ["visual", "reading", "practice", "listening", "explaining"] as const;
const felt = ["Easy", "Okay", "Hard", "Impossible"] as const;

const classroomTaskSeeds = [
  {
    id: "classroom-accreditation-prep",
    title: "Assessment preparation for the accreditation session",
    subjectId: "thinking",
    description: "Bring the evidence and questions needed for the Design Thinking accreditation session.",
    deadline: "2026-08-03T21:59:00.000Z",
    estimatedMinutes: 45,
    actualMinutes: 0,
    priority: 3 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Revise" as const,
    status: "planned" as const,
    notes: "Google Classroom: Complete during Accreditation Session | Assessment Preparation — due 3 August 2026.",
    subtasks: [{ id: "classroom-prep-check", title: "Check the evidence list before the session", done: false }],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-popi-consent",
    title: "POPI Act consent form",
    subjectId: "research",
    description: "Keep the consent record with the research evidence for the sprint.",
    deadline: "2026-08-04T21:59:00.000Z",
    estimatedMinutes: 20,
    actualMinutes: 0,
    priority: 3 as const,
    difficulty: 2 as const,
    energy: 2 as const,
    focus: 2 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom showed this as due yesterday when the course was checked. Confirm the submission status.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-quiz-knowledge",
    title: "Quiz: test your Design Thinking knowledge",
    subjectId: "thinking",
    description: "Use the quiz as a quick retrieval check before the assessment work.",
    deadline: "2026-08-18T17:00:00.000Z",
    estimatedMinutes: 20,
    actualMinutes: 0,
    priority: 1 as const,
    difficulty: 2 as const,
    energy: 2 as const,
    focus: 2 as const,
    type: "Practise" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date; 18 August is a personal planning target only.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-phase-1-submit",
    title: "Phase 1: Understand & Empathise — submit your work",
    subjectId: "experience",
    description: "Submit an individual copy of the team evidence: interviews, observations, empathy maps, personas, journeys and key insights.",
    deadline: "2026-08-06T17:00:00.000Z",
    estimatedMinutes: 35,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Write" as const,
    status: "working" as const,
    notes: "Google Classroom did not list a separate due date. The date here is a private planning target ahead of the 14 August hand-in.",
    subtasks: [{ id: "phase-1-files", title: "Check that every evidence file opens", done: false }],
    conceptIds: ["affinity-mapping"],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-formative-define",
    title: "Formative assessment: Define",
    subjectId: "thinking",
    description: "Complete the Define practice assessment while the evidence is still fresh.",
    deadline: "2026-08-07T17:00:00.000Z",
    estimatedMinutes: 40,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date; this is a private planning target.",
    subtasks: [],
    conceptIds: ["point-of-view", "how-might-we"],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-formative-ideate",
    title: "Formative assessment: Ideate",
    subjectId: "thinking",
    description: "Capture the divergent ideas, selection reasoning and the next experiment.",
    deadline: "2026-08-08T17:00:00.000Z",
    estimatedMinutes: 40,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date; this is a private planning target.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-summative-define",
    title: "Summative assessment: Define",
    subjectId: "thinking",
    description: "Prepare the final Define evidence pack for assessment review.",
    deadline: "2026-08-09T17:00:00.000Z",
    estimatedMinutes: 50,
    actualMinutes: 0,
    priority: 3 as const,
    difficulty: 4 as const,
    energy: 4 as const,
    focus: 4 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date; this is a private planning target.",
    subtasks: [],
    conceptIds: ["bpmn"],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-summative-ideate",
    title: "Summative assessment: Ideate",
    subjectId: "thinking",
    description: "Prepare the final Ideate evidence, concepts and selection rationale.",
    deadline: "2026-08-10T17:00:00.000Z",
    estimatedMinutes: 50,
    actualMinutes: 0,
    priority: 3 as const,
    difficulty: 4 as const,
    energy: 4 as const,
    focus: 4 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date; this is a private planning target.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-phase-3-submit",
    title: "Phase 3: Ideate — submit your work",
    subjectId: "experience",
    description: "Submit the individual copy of the Ideate work and the evidence behind the chosen direction.",
    deadline: "2026-08-11T17:00:00.000Z",
    estimatedMinutes: 30,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Write" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a separate due date. This is a private planning target.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-phase-4-submit",
    title: "Phase 4: Prototype — submit your work",
    subjectId: "experience",
    description: "Submit the prototype, flow and the reasoning that connects it to the user need.",
    deadline: "2026-08-12T17:00:00.000Z",
    estimatedMinutes: 35,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 4 as const,
    type: "Build" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a separate due date. This is a private planning target.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-phase-5-submit",
    title: "Phase 5: Test — submit your work",
    subjectId: "experience",
    description: "Submit test notes, observations, participant feedback and the changes that followed.",
    deadline: "2026-08-13T17:00:00.000Z",
    estimatedMinutes: 35,
    actualMinutes: 0,
    priority: 2 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Research" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a separate due date. This is a private planning target.",
    subtasks: [],
    conceptIds: ["usability-testing"],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
  {
    id: "classroom-final-presentation",
    title: "Final presentation — submit your assignment",
    subjectId: "experience",
    description: "Bring the full sprint story together for the final presentation and individual Classroom submission.",
    deadline: "2026-08-13T19:00:00.000Z",
    estimatedMinutes: 45,
    actualMinutes: 0,
    priority: 3 as const,
    difficulty: 3 as const,
    energy: 3 as const,
    focus: 3 as const,
    type: "Discuss" as const,
    status: "planned" as const,
    notes: "Google Classroom did not list a due date. This is a private planning target before the 14 August final checks.",
    subtasks: [],
    conceptIds: [],
    createdAt: "2026-07-30T08:00:00.000Z",
  },
] satisfies AppState["tasks"];

function dateAt(daysAgo: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, (daysAgo * 7) % 60, 0, 0);
  return date.toISOString();
}

export function seedDemoRecords(state: AppState) {
  for (const task of classroomTaskSeeds) {
    if (!state.tasks.some((item) => item.id === task.id)) state.tasks.push({ ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) });
  }
  if (state.weatherCheckins.some((item) => item.id === "seed-weather-0")) return state;
  // Add enough history for the forecast, journal and learning views to be useful on the first visit.

  if (!state.tasks.some((item) => item.id === "seed-task-0")) {
    for (let index = 0; index < 16; index += 1) {
      state.tasks.push({
        id: `seed-task-${index}`,
        title: taskTitles[index],
        subjectId: subjects[index % subjects.length],
        description: `A small, concrete pass on ${taskTitles[index].toLowerCase()}.`,
        deadline: dateAt(index % 8, 11 + (index % 8)),
        estimatedMinutes: 12 + (index % 5) * 8,
        actualMinutes: index % 4 === 0 ? 12 : 0,
        priority: ((index % 3) + 1) as 1 | 2 | 3,
        difficulty: ((index % 5) + 1) as 1 | 2 | 3 | 4 | 5,
        energy: (((index + 1) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
        focus: (((index + 2) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
        type: taskTypes[index % taskTypes.length],
        status: index % 7 === 0 ? "done" : index % 5 === 0 ? "working" : index % 4 === 0 ? "inbox" : "planned",
        notes: index % 3 === 0 ? "Leave a visible first move for tomorrow." : "Keep the finish small and observable.",
        subtasks: [{ id: `seed-subtask-${index}`, title: "Write the first visible action", done: index % 4 === 0 }],
        conceptIds: [],
        createdAt: dateAt(index + 10, 9),
        ...(index % 7 === 0 ? { completedAt: dateAt(index % 8, 16) } : {}),
      });
    }
  }

  const taskPool = state.tasks.map((task) => task.id);

  for (let index = 0; index < 40; index += 1) {
    state.weatherCheckins.push({ id: `seed-weather-${index}`, weather: weather[index % weather.length], energy: (index % 5) + 1, focus: ((index * 2) % 5) + 1, stress: ((index * 3) % 5) + 1, motivation: ((index * 4) % 5) + 1, createdAt: dateAt(index + 2, 8 + (index % 12)) });
  }

  for (let index = 0; index < 55; index += 1) {
    const minutes = 8 + (index % 5) * 5;
    const taskId = taskPool[index % taskPool.length];
    const subjectId = state.tasks.find((task) => task.id === taskId)?.subjectId ?? subjects[index % subjects.length];
    state.sessions.push({ id: `seed-session-${index}`, taskId, subjectId, minutes, completedMinutes: Math.max(4, minutes - (index % 4 === 0 ? 0 : index % 3)), focusQuality: (((index * 3) % 5) + 1) as 1 | 2 | 3 | 4 | 5, felt: felt[index % felt.length], method: methods[index % methods.length], completedAt: dateAt(index + 3, 10 + (index % 10)) });
  }

  const mistakeTopics = ["Spacing rhythm", "Promise errors", "Leading questions", "Focus rings", "State ownership", "CSS specificity", "Research synthesis"];
  for (let index = 0; index < 25; index += 1) {
    state.mistakes.push({ id: `seed-mistake-${index}`, subjectId: subjects[index % subjects.length], topic: mistakeTopics[index % mistakeTopics.length], whatWentWrong: "The first version answered the wrong question.", originalThought: "If it looked finished, it must be close.", correction: "Name the evidence before polishing the surface.", insight: "A smaller test made the next decision easier.", stage: (index % 5) as 0 | 1 | 2 | 3 | 4, createdAt: dateAt(index + 4, 14) });
  }

  for (let index = 0; index < 20; index += 1) {
    const taskId = taskPool[index % taskPool.length];
    const subjectId = state.tasks.find((task) => task.id === taskId)?.subjectId ?? subjects[index % subjects.length];
    state.ghostNotes.push({ id: `seed-note-${index}`, subjectId, taskId, conceptId: state.concepts[index % state.concepts.length]?.id, message: [`Past you: start with the rough version.`, `Future you: name the edge case before the happy path.`, `This was easier once the first step had a verb.`][index % 3], createdAt: dateAt(index + 6, 17) });
  }

  const journalPrompts = ["What clicked today?", "What confused you?", "What would make tomorrow easier?", "What took more energy than expected?"];
  for (let index = 0; index < 20; index += 1) {
    state.journal.push({ id: `seed-journal-${index}`, prompt: journalPrompts[index % journalPrompts.length], text: ["The problem became friendlier when I stopped asking it to be finished.", "I needed an example before I needed another explanation.", "A short session left enough energy to return tomorrow."][index % 3], weather: weather[index % weather.length], subjectId: subjects[index % subjects.length], tags: ["reflection", index % 2 ? "small-wins" : "learning"], createdAt: dateAt(index + 5, 19) });
  }

  for (let index = 0; index < 12; index += 1) {
    state.concepts.push({ id: `seed-concept-${index}`, subjectId: subjects[index % subjects.length], name: ["Error boundaries", "Layout rhythm", "Interview probes", "Component states", "Visual hierarchy", "Retrieval cues"][index % 6], x: 10 + ((index * 17) % 80), y: 15 + ((index * 29) % 70), level: (index % 5) as 0 | 1 | 2 | 3 | 4, confidence: 30 + ((index * 7) % 65), related: [], notes: "A concept with a little evidence attached." });
  }

  const bands: WellbeingBand[] = ["low-signal", "worth-noticing", "talk-to-someone"];
  for (let index = 0; index < 12; index += 1) state.wellbeingCheckins.push({ id: `seed-wellbeing-${index}`, kind: index % 2 ? "attention" : "anxiety", score: 2 + (index % 10), band: bands[index % bands.length], createdAt: dateAt(index + 2, 9) });

  return state;
}
