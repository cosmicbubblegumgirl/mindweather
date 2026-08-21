import type { AppState, WeatherId } from "@/lib/types";

export type StudyPathId = "frontend" | "design" | "research" | "sap" | "career" | "general";
export type ResourceFormat = "guide" | "course" | "practice" | "reference" | "community";

export interface StudyResource {
  id: string;
  title: string;
  provider: string;
  description: string;
  url: string;
  paths: StudyPathId[];
  topics: string[];
  formats: ResourceFormat[];
  intensity: 1 | 2 | 3;
  free: boolean;
}

export interface ResourceRecommendation extends StudyResource {
  score: number;
  reason: string;
}

const resources: StudyResource[] = [
  { id: "mdn-learn", title: "Learn web development", provider: "MDN", description: "Structured, standards-based lessons from first page to production patterns.", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", paths: ["frontend"], topics: ["html", "css", "javascript", "accessibility", "frontend"], formats: ["guide", "reference"], intensity: 2, free: true },
  { id: "mdn-reference", title: "Web technology reference", provider: "MDN", description: "A precise place to check browser APIs, CSS properties, and JavaScript behaviour.", url: "https://developer.mozilla.org/en-US/docs/Web", paths: ["frontend"], topics: ["javascript", "css", "html", "api"], formats: ["reference"], intensity: 2, free: true },
  { id: "freecodecamp", title: "Responsive Web Design", provider: "freeCodeCamp", description: "Short practical lessons that turn concepts into working pages.", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", paths: ["frontend"], topics: ["frontend", "responsive", "css", "html"], formats: ["course", "practice"], intensity: 2, free: true },
  { id: "web-a11y", title: "Web accessibility fundamentals", provider: "web.dev", description: "A practical route through semantic HTML, focus, colour, and assistive technology.", url: "https://web.dev/learn/accessibility/", paths: ["frontend", "design"], topics: ["accessibility", "ux", "frontend"], formats: ["course", "guide"], intensity: 2, free: true },
  { id: "figma-design", title: "Design basics", provider: "Figma", description: "Short explanations and hands-on exercises for interface and visual design.", url: "https://help.figma.com/hc/en-us/categories/360002051613-Design-basics", paths: ["design"], topics: ["figma", "design", "prototype", "ux"], formats: ["guide", "practice"], intensity: 1, free: true },
  { id: "nng-articles", title: "UX research and design articles", provider: "Nielsen Norman Group", description: "Evidence-led explanations of usability, research methods, and interface decisions.", url: "https://www.nngroup.com/articles/", paths: ["design", "research"], topics: ["ux", "research", "usability", "design"], formats: ["guide", "reference"], intensity: 2, free: true },
  { id: "ideo-methods", title: "Design Kit methods", provider: "IDEO.org", description: "Human-centred research and ideation methods with concrete steps.", url: "https://www.designkit.org/methods", paths: ["design", "research"], topics: ["design thinking", "interview", "ideation", "research"], formats: ["guide", "practice"], intensity: 1, free: true },
  { id: "interaction-design", title: "UX design open literature", provider: "Interaction Design Foundation", description: "A broad reference library for interaction design and user research concepts.", url: "https://www.interaction-design.org/literature", paths: ["design", "research"], topics: ["ux", "research", "interaction"], formats: ["reference", "guide"], intensity: 2, free: true },
  { id: "sap-learning", title: "SAP Learning", provider: "SAP", description: "Official learning journeys, courses, and certification preparation.", url: "https://learning.sap.com/", paths: ["sap"], topics: ["sap", "integration", "business process", "certification"], formats: ["course", "practice"], intensity: 3, free: true },
  { id: "sap-developers", title: "SAP Developers tutorials", provider: "SAP", description: "Guided tutorials for building and integrating on SAP platforms.", url: "https://developers.sap.com/tutorial-navigator.html", paths: ["sap", "frontend"], topics: ["sap", "api", "integration", "development"], formats: ["practice", "reference"], intensity: 3, free: true },
  { id: "google-research", title: "Research and source evaluation", provider: "Google Search Education", description: "Techniques for checking sources, investigating claims, and searching with purpose.", url: "https://search.google/intl/en-GB/education/", paths: ["research", "general"], topics: ["research", "sources", "evidence"], formats: ["guide", "practice"], intensity: 1, free: true },
  { id: "purdue-writing", title: "Academic writing guides", provider: "Purdue OWL", description: "Clear help with research, citations, structure, and revision.", url: "https://owl.purdue.edu/owl/research_and_citation/index.html", paths: ["research", "career", "general"], topics: ["writing", "citation", "research", "assignment"], formats: ["guide", "reference"], intensity: 2, free: true },
  { id: "linkedin-career", title: "Job search guide", provider: "LinkedIn", description: "A practical guide to profiles, applications, networking, and interview preparation.", url: "https://opportunity.linkedin.com/", paths: ["career"], topics: ["career", "linkedin", "interview", "job"], formats: ["guide", "course"], intensity: 2, free: true },
  { id: "skillsbuild", title: "Workplace and digital skills", provider: "IBM SkillsBuild", description: "Free learning paths for professional skills, technology, and career readiness.", url: "https://skillsbuild.org/", paths: ["career", "general", "frontend"], topics: ["career", "communication", "technology"], formats: ["course"], intensity: 2, free: true },
  { id: "khan-study", title: "Study skills and subject practice", provider: "Khan Academy", description: "Explanations and practice that can fill a knowledge gap without a high-pressure pace.", url: "https://www.khanacademy.org/", paths: ["general"], topics: ["study", "practice", "math", "science"], formats: ["course", "practice"], intensity: 1, free: true },
  { id: "anki-manual", title: "Active recall with Anki", provider: "Anki", description: "A reference for building useful spaced-repetition cards instead of tiny trivia traps.", url: "https://docs.ankiweb.net/getting-started.html", paths: ["general", "sap", "career"], topics: ["memorise", "revision", "recall", "certification"], formats: ["guide", "practice"], intensity: 2, free: true },
];

const pathLabels: Record<StudyPathId, string> = {
  frontend: "Frontend development",
  design: "UX and product design",
  research: "Research and academic work",
  sap: "SAP and integration",
  career: "Career readiness",
  general: "Flexible study",
};

const pathSignals: Record<StudyPathId, string[]> = {
  frontend: ["frontend", "web", "javascript", "react", "html", "css", "developer", "coding", "api"],
  design: ["ux", "ui", "design", "figma", "prototype", "wireframe", "user experience"],
  research: ["research", "academic", "interview", "evidence", "citation", "thesis"],
  sap: ["sap", "integration developer", "business process", "bpmn"],
  career: ["career", "linkedin", "work readiness", "interview", "communication", "job"],
  general: ["study", "general", "learning"],
};

const calmWeather = new Set<WeatherId>(["battery", "foggy", "storm"]);

function haystack(state: AppState) {
  return [
    state.profile.field,
    ...state.subjects.map((subject) => subject.name),
    ...state.tasks.filter((task) => task.status !== "done").flatMap((task) => [task.title, task.description, task.notes, task.type]),
  ].join(" ").toLowerCase();
}

export function detectStudyPath(state: AppState) {
  const text = haystack(state);
  const scored = (Object.keys(pathSignals) as StudyPathId[]).map((id) => ({
    id,
    score: pathSignals[id].reduce((score, signal) => score + (text.includes(signal) ? (signal.length > 7 ? 3 : 2) : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const primary = scored[0]?.score ? scored[0].id : "general";
  return { primary, label: pathLabels[primary], confidence: Math.min(100, 42 + (scored[0]?.score ?? 0) * 8) };
}

export function rankResources(state: AppState): ResourceRecommendation[] {
  const path = detectStudyPath(state);
  const text = haystack(state);
  const lowCapacity = calmWeather.has(state.currentWeather);
  const preferredFormats = new Set<ResourceFormat>();
  if (state.profile.learningMethods.some((method) => /doing|practice|hands/i.test(method))) preferredFormats.add("practice");
  if (state.profile.learningMethods.some((method) => /read|text|note/i.test(method))) preferredFormats.add("guide");

  return resources.map((resource) => {
    let score = resource.paths.includes(path.primary) ? 30 : resource.paths.includes("general") ? 8 : 0;
    const topicMatches = resource.topics.filter((topic) => text.includes(topic)).length;
    score += topicMatches * 7;
    if (lowCapacity && resource.intensity === 1) score += 10;
    if (lowCapacity && resource.intensity === 3) score -= 8;
    if (!lowCapacity && resource.intensity >= 2) score += 4;
    if (resource.formats.some((format) => preferredFormats.has(format))) score += 6;
    const reason = topicMatches > 0
      ? `Matches ${path.label.toLowerCase()} and ${topicMatches === 1 ? "a topic in your current work" : `${topicMatches} topics in your current work`}.`
      : lowCapacity && resource.intensity === 1
        ? `A lighter starting point for a ${state.currentWeather} day.`
        : `A useful ${resource.formats[0]} for your ${path.label.toLowerCase()} path.`;
    return { ...resource, score, reason };
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function resourceIntensityLabel(intensity: StudyResource["intensity"]) {
  return intensity === 1 ? "Quick start" : intensity === 2 ? "Steady depth" : "Deep dive";
}
