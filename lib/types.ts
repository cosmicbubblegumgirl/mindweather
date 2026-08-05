export type WeatherId =
  | "clear"
  | "breezy"
  | "storm"
  | "battery"
  | "hyperfocus"
  | "foggy";

export type ViewId =
  | "weather"
  | "plan"
  | "focus"
  | "constellation"
  | "tasks"
  | "forecast"
  | "garden"
  | "notes"
  | "calendar"
  | "rooms"
  | "journal"
  | "dna"
  | "wellbeing"
  | "research"
  | "settings";

export type TaskStatus = "inbox" | "planned" | "working" | "blocked" | "done";
export type TaskType =
  | "Read"
  | "Research"
  | "Build"
  | "Practise"
  | "Revise"
  | "Write"
  | "Memorise"
  | "Watch"
  | "Discuss"
  | "Other";

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  deadline: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: 1 | 2 | 3;
  difficulty: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  type: TaskType;
  status: TaskStatus;
  notes: string;
  subtasks: Subtask[];
  conceptIds: string[];
  createdAt: string;
  completedAt?: string;
}

export interface WeatherCheckin {
  id: string;
  weather: WeatherId;
  energy: number;
  focus: number;
  stress: number;
  motivation: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  subjectId: string;
  minutes: number;
  completedMinutes: number;
  focusQuality: 1 | 2 | 3 | 4 | 5;
  felt: "Easy" | "Okay" | "Hard" | "Impossible";
  method: "visual" | "reading" | "practice" | "listening" | "explaining";
  completedAt: string;
}

export interface Concept {
  id: string;
  subjectId: string;
  name: string;
  x: number;
  y: number;
  level: 0 | 1 | 2 | 3 | 4;
  confidence: number;
  related: string[];
  notes: string;
}

export interface Mistake {
  id: string;
  subjectId: string;
  topic: string;
  whatWentWrong: string;
  originalThought: string;
  correction: string;
  insight: string;
  stage: 0 | 1 | 2 | 3 | 4;
  createdAt: string;
}

export interface GhostNote {
  id: string;
  subjectId: string;
  conceptId?: string;
  taskId?: string;
  message: string;
  createdAt: string;
  surfacedAt?: string;
}

export interface JournalEntry {
  id: string;
  prompt: string;
  text: string;
  weather: WeatherId;
  subjectId?: string;
  tags: string[];
  createdAt: string;
}

export interface AssignmentSection {
  id: string;
  title: string;
  description: string;
  estimate: number;
  energy: 1 | 2 | 3 | 4 | 5;
  status: "not-started" | "working" | "done";
  blockers: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  deadline: string;
  outcome: string;
  sections: AssignmentSection[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type WellbeingKind = "anxiety" | "attention";
export type WellbeingBand = "low-signal" | "worth-noticing" | "talk-to-someone";

export interface WellbeingCheckin {
  id: string;
  kind: WellbeingKind;
  score: number;
  band: WellbeingBand;
  createdAt: string;
}

export interface StudyDNAMetric {
  id: string;
  label: string;
  value: number;
  evidence: string;
  confirmed?: boolean;
}

export interface Preferences {
  theme: "atmospheric" | "midnight" | "cloudlight" | "contrast";
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  notifications: boolean;
  streaks: boolean;
  focusLength: number;
  breakLength: number;
  overwhelmAction: "simplify" | "one-task" | "break" | "prioritise" | "ask";
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  initials: string;
  field: string;
  focusWindow: string;
  learningMethods: string[];
  obstacles: string[];
  onboarded: boolean;
}

export interface AppState {
  version: number;
  profile: Profile;
  preferences: Preferences;
  subjects: Subject[];
  tasks: StudyTask[];
  weatherCheckins: WeatherCheckin[];
  sessions: StudySession[];
  concepts: Concept[];
  mistakes: Mistake[];
  ghostNotes: GhostNote[];
  journal: JournalEntry[];
  assignments: Assignment[];
  notifications: NotificationItem[];
  wellbeingCheckins: WellbeingCheckin[];
  dna: StudyDNAMetric[];
  freezeMode: boolean;
  currentWeather: WeatherId;
  currentSession?: {
    taskId?: string;
    startedAt: string;
    remainingSeconds: number;
    totalSeconds: number;
    running: boolean;
  };
}

export interface PlanStep {
  id: string;
  taskId?: string;
  title: string;
  subject: string;
  minutes: number;
  kind: "study" | "reset" | "review";
  reason: string;
  done: boolean;
}
