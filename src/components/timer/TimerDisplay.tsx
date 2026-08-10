"use client";

import type { ReactNode } from "react";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { formatClock, formatOvertime, formatTimer } from "@/lib/timer/format";

/**
 * The dominant visual element of the focus screen. Reads all values from the
 * timestamp-derived timer hook — this component is the only thing that
 * re-renders on every tick.
 */
export function TimerDisplay() {
  const { session, status, elapsedSec, remainingSec, overtimeSec } = useFocusTimer();

  if (!session) return null;

  const isTarget = session.mode === "target";

  // Overtime: show the frozen target and the running overtime chip.
  if (isTarget && status === "overtime") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[0.7rem] font-medium tracking-[0.3em] text-white/50 uppercase">
            Target
          </span>
          <span className="font-tabular text-4xl font-semibold text-white/60 sm:text-5xl">
            {formatTimer((session.targetDuration ?? 0) * 60)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[0.7rem] font-medium tracking-[0.3em] text-accent-vivid uppercase">
            Overtime
          </span>
          <span className="font-tabular ember-glow text-7xl font-bold text-accent-vivid sm:text-8xl">
            {formatOvertime(overtimeSec)}
          </span>
        </div>
      </div>
    );
  }

  const mainTime = isTarget
    ? formatTimer(remainingSec)
    : formatClock(elapsedSec);

  const progress = isTarget
    ? ((session.targetDuration ?? 0) * 60 - remainingSec) / ((session.targetDuration ?? 0) * 60)
    : 0;

  return (
    <span className="font-tabular ember-glow relative inline-block text-[clamp(3.5rem,17vw,11rem)] leading-none font-bold tracking-tight">
      {isTarget && status !== "target_reached" ? (
        <TimerRing progress={progress}>{mainTime}</TimerRing>
      ) : (
        mainTime
      )}
    </span>
  );
}

/** Thin circular progress ring that wraps the digits for target sessions. */
function TimerRing({ progress, children }: { progress: number; children: ReactNode }) {
  const R = 47;
  const circumference = 2 * Math.PI * R;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <span className="relative grid aspect-square place-items-center p-[28px] text-accent-vivid sm:p-[32px]">
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="1"
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="relative text-[oklch(0.95_0.012_70)]">{children}</span>
    </span>
  );
}
