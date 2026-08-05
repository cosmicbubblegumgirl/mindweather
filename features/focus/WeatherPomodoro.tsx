"use client";

import { Bloop } from "@/components/brand/Bloop";
import { useMindWeather } from "@/hooks/useMindWeather";
import { WEATHER } from "@/lib/weather";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PomodoroState = { phase: "work" | "rest"; seconds: number; total: number; round: number; running: boolean };

const rhythmFor = (weather: keyof typeof WEATHER) => {
  if (weather === "hyperfocus") return { work: 45, rest: 5 };
  if (weather === "clear") return { work: 25, rest: 5 };
  if (weather === "storm" || weather === "battery") return { work: 8, rest: 3 };
  return { work: 18, rest: 4 };
};

export function WeatherPomodoro() {
  const { state } = useMindWeather();
  const rhythm = useMemo(() => rhythmFor(state.currentWeather), [state.currentWeather]);
  const [timer, setTimer] = useState<PomodoroState | null>(null);

  useEffect(() => {
    if (!timer?.running) return undefined;
    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (!current) return current;
        if (current.seconds > 1) return { ...current, seconds: current.seconds - 1 };
        const nextPhase = current.phase === "work" ? "rest" : "work";
        const nextMinutes = nextPhase === "work" ? rhythm.work : rhythm.rest;
        return { ...current, phase: nextPhase, seconds: nextMinutes * 60, total: nextMinutes * 60, round: nextPhase === "work" ? current.round + 1 : current.round };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer?.running, rhythm]);

  const start = () => setTimer({ phase: "work", seconds: rhythm.work * 60, total: rhythm.work * 60, round: 1, running: true });
  const current = timer ?? { phase: "work" as const, seconds: rhythm.work * 60, total: rhythm.work * 60, round: 1, running: false };
  const progress = ((current.total - current.seconds) / current.total) * 100;
  const time = `${String(Math.floor(current.seconds / 60)).padStart(2, "0")}:${String(current.seconds % 60).padStart(2, "0")}`;

  return <section className="pomodoro-card panel">
    <div className="pomodoro-card__top"><span>WEATHER POMODORO</span><Bloop mood={current.phase === "rest" ? "happy" : "thinking"} size="sm" /></div>
    <div className="pomodoro-card__timer"><strong>{time}</strong><small>{current.phase === "work" ? "FOCUS" : "PAUSE"} · ROUND {current.round}</small></div>
    <div className="pomodoro-progress"><span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
    <p>{current.phase === "work" ? `${rhythm.work} minutes of one visible thing.` : `${rhythm.rest} minutes to let your attention land.`}</p>
    <div className="pomodoro-card__actions">
      {!timer ? <button className="button button--peach button--small" onClick={start}><Play /> Start</button> : <button className="button button--peach button--small" onClick={() => setTimer({ ...current, running: !current.running })}>{current.running ? <Pause /> : <Play />} {current.running ? "Pause" : "Resume"}</button>}
      <button className="icon-button" onClick={() => setTimer(null)} aria-label="Reset Pomodoro"><RotateCcw /></button>
    </div>
  </section>;
}
