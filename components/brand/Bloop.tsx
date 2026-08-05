"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

export type BloopMood = "neutral" | "happy" | "thinking" | "sleepy" | "overwhelmed" | "celebrating" | "confused" | "encouraging";

export function Bloop({ mood = "neutral", size = "md", label }: { mood?: BloopMood; size?: "sm" | "md" | "lg"; label?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={clsx("bloop-wrap", `bloop-wrap--${size}`)} aria-label={label ?? `Bloop is ${mood}`} role="img">
      <motion.div
        className={clsx("bloop", `bloop--${mood}`)}
        animate={reduced ? undefined : mood === "celebrating" ? { y: [0, -8, 0], rotate: [0, -5, 5, 0] } : mood === "sleepy" ? { y: [0, 2, 0] } : { y: [0, -3, 0] }}
        transition={{ duration: mood === "celebrating" ? 0.65 : 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="bloop__shine" />
        <span className="bloop__face">
          <i className="bloop__eye bloop__eye--left" />
          <i className="bloop__eye bloop__eye--right" />
          <i className="bloop__mouth" />
        </span>
        <span className="bloop__foot bloop__foot--left" />
        <span className="bloop__foot bloop__foot--right" />
      </motion.div>
      {mood === "celebrating" && !reduced && <span className="bloop-spark">✦</span>}
    </div>
  );
}
