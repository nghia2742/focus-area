"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import type { PomodoroPhase } from "./types";

interface RoundDotsProps {
  totalRounds: number;
  roundsCompleted: number;
  round: number;
  phase: PomodoroPhase;
}

/** Round progress: filled = done, pulsing outline = current focus round, empty = ahead. */
export function RoundDots({ totalRounds, roundsCompleted, round, phase }: RoundDotsProps) {
  const reduced = usePrefersReducedMotion();
  const count = Math.min(totalRounds, 12);

  return (
    <ol className="flex items-center justify-center gap-1.5" aria-label="Round progress">
      {Array.from({ length: count }, (_, index) => {
        const value = index + 1;
        const done = index < roundsCompleted;
        const current = !done && phase === "focus" && value === round;
        const label = done
          ? `Round ${value}, completed`
          : current
            ? `Round ${value}, in progress`
            : `Round ${value}, upcoming`;

        return (
          <li
            key={value}
            aria-label={label}
            className={cn(
              "size-2 rounded-full border",
              !reduced && "transition-colors duration-[400ms]",
              done
                ? "border-artwork-ink bg-artwork-ink"
                : current
                  ? cn("border-artwork-ink", !reduced && "dot-pulse")
                  : "border-artwork-line",
            )}
          />
        );
      })}
    </ol>
  );
}
