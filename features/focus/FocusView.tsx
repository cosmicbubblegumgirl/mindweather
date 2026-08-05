"use client";

import { Bloop } from "@/components/brand/Bloop";
import { Modal } from "@/components/ui/Modal";
import { WeatherPomodoro } from "@/features/focus/WeatherPomodoro";
import { useMindWeather } from "@/hooks/useMindWeather";
import { localPlanner } from "@/lib/planningEngine";
import type { ViewId } from "@/lib/types";
import { WEATHER } from "@/lib/weather";
import { BookOpen, Check, ChevronRight, CircleStop, MessageCircle, Pause, Play, RotateCcw, Send, Timer, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function FocusView({ navigate = () => undefined }: { navigate?(view: ViewId): void }) {
  const { state, startSession, updateSession, finishSession } = useMindWeather();
  const [mode, setMode] = useState<"session" | "teach">("session");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [felt, setFelt] = useState<"Easy" | "Okay" | "Hard" | "Impossible">("Okay");
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [messages, setMessages] = useState<{ from: "you" | "bloop"; text: string }[]>([{ from: "bloop", text: "Pick an idea and explain it as if I’ve never met it before." }]);
  const [teaching, setTeaching] = useState("");
  const current = state.currentSession;
  const task = state.tasks.find((item) => item.id === current?.taskId);
  const remaining = current?.remainingSeconds ?? 0;
  const total = current?.totalSeconds ?? 1;
  const progress = Math.max(0, Math.min(1, 1 - remaining / total));

  useEffect(() => {
    if (!current?.running) return;
    const timer = window.setInterval(() => {
      if (current.remainingSeconds <= 1) { updateSession({ remainingSeconds: 0, running: false }); setRatingOpen(true); }
      else updateSession({ remainingSeconds: current.remainingSeconds - 1 });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [current?.running, current?.remainingSeconds, updateSession]);

  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const suggested = state.currentWeather === "hyperfocus" ? 45 : state.currentWeather === "clear" ? 25 : 8;

  const teach = () => {
    if (!teaching.trim()) return;
    const text = teaching.trim();
    const turn = messages.filter((message) => message.from === "you").length;
    const subject = task ? state.subjects.find((item) => item.id === task.subjectId)?.name : state.subjects[0]?.name;
    const reply = localPlanner.teachReply(text, turn, { subject, task: task?.title, weather: state.currentWeather, previous: messages.filter((message) => message.from === "you").map((message) => message.text) });
    setMessages((items) => [...items, { from: "you", text }, { from: "bloop", text: reply }]);
    setTeaching("");
  };

  const complete = () => {
    const elapsed = Math.max(1, Math.round((total - remaining) / 60));
    finishSession({ felt, focusQuality: quality, completedMinutes: elapsed });
    setRatingOpen(false);
  };

  return <div className="focus-page">
    <header className="view-heading view-heading--row"><div><span className="view-heading__eyebrow">Focus studio</span><h1>One thing, with room around it.</h1><p>No forced stopping. No productivity theatre. Just a session that fits today’s weather.</p></div><div className="segmented"><button className={mode === "session" ? "active" : ""} onClick={() => setMode("session")}><Timer /> Session</button><button className={mode === "teach" ? "active" : ""} onClick={() => setMode("teach")}><MessageCircle /> Teach Bloop</button></div></header>
    {mode === "session" ? <div className="focus-layout">
      <section className="focus-clock panel">
        {!current ? <div className="focus-empty"><span className={`focus-weather-symbol focus-weather-symbol--${state.currentWeather}`}><Timer /></span><small>{WEATHER[state.currentWeather].label.toUpperCase()} RHYTHM</small><h2>{suggested} minutes<br />to begin.</h2><p>{state.currentWeather === "hyperfocus" ? "A longer runway, with an optional interruption check." : state.currentWeather === "clear" ? "Enough room for depth. You can continue if the flow is good." : "A small, honest beginning. Three minutes of space afterwards."}</p><select className="select" defaultValue={state.tasks.find((item) => item.status !== "done")?.id}>{state.tasks.filter((item) => item.status !== "done").map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><button className="button button--peach" onClick={(event) => { const select = event.currentTarget.previousElementSibling as HTMLSelectElement; startSession(select.value, suggested); }}><Play /> Start gently</button></div> : <div className="timer-active">
          <div className="timer-ring" style={{ "--progress": `${progress * 360}deg` } as React.CSSProperties}><div><span>{time}</span><small>{current.running ? "IN THE WEATHER" : "PAUSED, NOT LOST"}</small></div></div>
          <div className="timer-task"><small>{task ? state.subjects.find((item) => item.id === task.subjectId)?.name : "Open focus"}</small><h2>{task?.title ?? "A quiet study session"}</h2><p>{task?.notes || "Stay with the smallest visible version of the work."}</p></div>
          <div className="timer-controls"><button className="icon-button" onClick={() => updateSession({ remainingSeconds: current.totalSeconds })} aria-label="Restart session"><RotateCcw /></button><button className="timer-play" onClick={() => updateSession({ running: !current.running })}>{current.running ? <Pause /> : <Play />}</button><button className="icon-button" onClick={() => { updateSession({ running: false }); setRatingOpen(true); }} aria-label="Finish session"><CircleStop /></button></div>
          <button className="flow-button" onClick={() => updateSession({ remainingSeconds: current.remainingSeconds + 5 * 60, totalSeconds: current.totalSeconds + 5 * 60 })}>Flow feels good · add five minutes</button>
        </div>}
      </section>
      <aside className="focus-side">
        <WeatherPomodoro />
        <section className="session-rhythm panel"><span>YOUR WEATHER RHYTHM</span><h3>{suggested} min <i /> {state.currentWeather === "hyperfocus" ? "optional check-in" : state.currentWeather === "clear" ? "5 min pause" : "3 min pause"}</h3><p>The timer will never force you to stop a productive flow.</p></section>
        <section className="focus-note panel"><BookOpen /><div><small>PAST-YOU NOTE</small><p>{state.ghostNotes.find((note) => note.taskId === task?.id)?.message ?? state.ghostNotes[0]?.message}</p></div></section>
        <button className="garden-reminder" onClick={() => navigate("garden")}><span>♧</span><div><strong>One useful mistake is nearby</strong><small>Review it when this session ends.</small></div><ChevronRight /></button>
      </aside>
    </div> : <div className="teach-layout panel">
      <aside className="teach-intro"><Bloop mood="thinking" size="lg" /><span>TEACH BLOOP</span><h2>Understanding gets clearer when it has to leave your head.</h2><p>Bloop will ask questions before offering an answer. That is the point.</p><div className="confidence-buttons"><button>I understand this</button><button>Still shaky</button><button>Need to revisit</button></div></aside>
      <section className="teach-chat"><header><span className="status-dot" /><div><strong>Bloop is listening</strong><small>Socratic mode · no instant answers</small></div><Volume2 /></header><div className="teach-messages">{messages.map((message, index) => <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={index} className={`message message--${message.from}`}>{message.from === "bloop" && <Bloop mood={index === messages.length - 1 ? "thinking" : "neutral"} size="sm" />}<p>{message.text}</p></motion.div>)}</div><div className="teach-input"><textarea value={teaching} onChange={(event) => setTeaching(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") teach(); }} placeholder="Explain the concept in your own words…" /><button onClick={teach} aria-label="Send explanation"><Send /></button></div></section>
    </div>}

    <Modal open={ratingOpen} onClose={() => setRatingOpen(false)} title="How did that session feel?" eyebrow="A quick reflection"><div className="session-rating"><p>This helps the forecast notice patterns in your own study history.</p><div className="felt-grid">{(["Easy", "Okay", "Hard", "Impossible"] as const).map((item) => <button key={item} className={felt === item ? "active" : ""} onClick={() => setFelt(item)}>{item}</button>)}</div><label><span>Focus quality <strong>{quality}/5</strong></span><input type="range" min="1" max="5" value={quality} onChange={(event) => setQuality(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)} /></label><button className="button button--peach" onClick={complete}>Save the session <Check /></button></div></Modal>
  </div>;
}
