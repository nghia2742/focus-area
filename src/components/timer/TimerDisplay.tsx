"use client";

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
          <span className="text-[0.7rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
            Target
          </span>
          <span className="font-tabular text-glow text-4xl font-semibold text-foreground/60 sm:text-5xl">
            {formatTimer((session.targetDuration ?? 0) * 60)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[0.7rem] font-medium tracking-[0.3em] text-accent-vivid uppercase">
            Overtime
          </span>
          <span className="font-tabular text-glow text-7xl font-bold text-accent-vivid sm:text-8xl">
            {formatOvertime(overtimeSec)}
          </span>
        </div>
      </div>
    );
  }

  const mainTime = isTarget
    ? formatTimer(remainingSec)
    : formatClock(elapsedSec);

  return (
    <span className="font-tabular text-glow text-[clamp(3.5rem,17vw,11rem)] leading-none font-bold tracking-tight">
      {mainTime}
    </span>
  );
}
