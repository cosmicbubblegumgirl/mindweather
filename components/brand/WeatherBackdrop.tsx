"use client";

import type { WeatherId } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";

export function WeatherBackdrop({ weather = "breezy", quiet = false }: { weather?: WeatherId; quiet?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className={`weather-backdrop weather-backdrop--${weather} ${quiet ? "weather-backdrop--quiet" : ""}`} aria-hidden="true">
      <motion.div className="weather-backdrop__aurora weather-backdrop__aurora--one" animate={reduced ? undefined : { x: [0, 24, -10, 0], y: [0, -16, 12, 0], scale: [1, 1.08, 0.96, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="weather-backdrop__aurora weather-backdrop__aurora--two" animate={reduced ? undefined : { x: [0, -30, 18, 0], y: [0, 18, -12, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <div className="weather-backdrop__stars">
        {Array.from({ length: 18 }).map((_, index) => <i key={index} style={{ "--x": `${(index * 37) % 100}%`, "--y": `${(index * 53) % 92}%`, "--delay": `${(index % 7) * -0.6}s` } as React.CSSProperties} />)}
      </div>
      {weather === "storm" && <div className="weather-backdrop__lightning" />}
      {weather === "foggy" && <div className="weather-backdrop__fog" />}
    </div>
  );
}
