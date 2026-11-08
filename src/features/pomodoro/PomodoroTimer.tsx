"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, SkipForwardIcon, SquareIcon } from "lucide-react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { formatTimer } from "@/lib/timer/format";
import { cn } from "@/lib/utils";
import { PHASE_LABELS } from "@/features/pomodoro/config";
import { phaseMs } from "@/features/pomodoro/machine";
import { RoundDots } from "@/features/pomodoro/RoundDots";
import { usePomodoro } from "@/features/pomodoro/usePomodoro";
import { TimerRing } from "@/features/focus/TimerDisplay";
import { EndConfirmDialog } from "@/features/focus/EndConfirmDialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface PomodoroTimerProps {
  onComplete?: (record: FocusSession) => void;
}

/** Immersive Pomodoro screen: phase, countdown, round dots, skip/awaiting controls. */
export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const { state, remainingMs, progress, pause, resume, skip, startNext, end } =
    usePomodoro();
  const finishPomodoro = useFocusStore((s) => s.finishPomodoro);
  const reduced = usePrefersReducedMotion();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const finished = useRef(false);

  /* `done` is reached by the last round, a skip, or an explicit end. */
  useEffect(() => {
    if (state?.status !== "done" || finished.current) return;
    finished.current = true;
    const record = finishPomodoro();
    if (record) onComplete?.(record);
  }, [state?.status, finishPomodoro, onComplete]);

  useEffect(() => {
    if (!state) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (showEndConfirm) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === " " || event.key.toLowerCase() === "k") {
        if (state.status !== "running" && state.status !== "paused") return;
        event.preventDefault();
        if (state.status === "paused") resume();
        else pause();
        return;
      }
      if (event.key.toLowerCase() === "n") {
        if (state.status !== "running" && state.status !== "paused") return;
        event.preventDefault();
        skip();
        return;
      }
      if (event.key === "Enter" && state.status === "awaiting") {
        event.preventDefault();
        startNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, showEndConfirm, pause, resume, skip, startNext]);

  if (!state) return null;

  const isBreak = state.phase !== "focus";
  const remainingSec = Math.ceil(remainingMs / 1000);
  const phaseLabel = PHASE_LABELS[state.phase];
  const elapsedFocusSec = Math.floor(
    (state.focusMsDone +
      (state.phase === "focus" ? phaseMs("focus", state.config) - remainingMs : 0)) /
      1000,
  );
  const isPaused = state.status === "paused";
  const isAwaiting = state.status === "awaiting";

  return (
    <>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-4 sm:gap-10">
        {state.task && (
          <p className="max-w-md truncate text-sm text-artwork-ink-muted">{state.task}</p>
        )}

        <div className="flex flex-col items-center gap-2">
          <div
            className="flex flex-col items-center gap-0.5"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              className={cn(
                "text-xs font-medium",
                !reduced && "transition-colors duration-[400ms]",
                isBreak ? "text-accent-break" : "text-artwork-ink-muted",
              )}
            >
              {phaseLabel}
            </span>
            {state.phase === "focus" && (
              <span className="text-xs text-artwork-ink-muted">
                Round {state.round}/{state.config.totalRounds}
              </span>
            )}
          </div>

          <span className="font-tabular ember-glow relative inline-block text-[clamp(3.5rem,17vw,11rem)] leading-none font-bold tracking-tight text-artwork-ink">
            <TimerRing
              progress={progress}
              className={cn(
                isBreak ? "text-accent-break" : "text-primary",
                !reduced && "transition-colors duration-[400ms]",
              )}
              digitClassName={cn(
                isBreak ? "text-accent-break" : "text-artwork-ink",
                !reduced && "transition-colors duration-[400ms]",
              )}
            >
              {formatTimer(remainingSec)}
            </TimerRing>
          </span>

          <RoundDots
            totalRounds={state.config.totalRounds}
            roundsCompleted={state.roundsCompleted}
            round={state.round}
            phase={state.phase}
          />
        </div>

        {state.status !== "done" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {isAwaiting ? (
                <>
                  <Button
                    size="xl"
                    className="rounded-full"
                    onClick={startNext}
                  >
                    {state.phase === "focus" ? "Start focus" : "Start break"}
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="rounded-full"
                    onClick={() => setShowEndConfirm(true)}
                  >
                    End Session
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="xl"
                    className="rounded-full"
                    onClick={() => (isPaused ? resume() : pause())}
                  >
                    {isPaused ? (
                      <>
                        <PlayIcon data-icon="inline-start" />
                        Resume
                      </>
                    ) : (
                      <>
                        <PauseIcon data-icon="inline-start" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="rounded-full px-3"
                    aria-label="Skip phase"
                    onClick={skip}
                  >
                    <SkipForwardIcon />
                  </Button>
                  <Button
                    variant="destructive"
                    size="xl"
                    className="rounded-full"
                    onClick={() => setShowEndConfirm(true)}
                  >
                    <SquareIcon data-icon="inline-start" />
                    End Session
                  </Button>
                </>
              )}
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-artwork-ink-muted sm:inline-flex">
              <Kbd className="bg-artwork-veil text-artwork-ink">
                {isAwaiting ? "Enter" : "Space"}
              </Kbd>{" "}
              {isAwaiting ? "to start the next phase" : "to pause or resume"}
              {!isAwaiting && (
                <>
                  {" · "}
                  <Kbd className="bg-artwork-veil text-artwork-ink">N</Kbd> to skip
                </>
              )}
            </span>
          </div>
        )}
      </div>

      <EndConfirmDialog
        open={showEndConfirm}
        onOpenChange={setShowEndConfirm}
        elapsedSec={elapsedFocusSec}
        onKeepFocusing={() => setShowEndConfirm(false)}
        onEndSession={() => {
          setShowEndConfirm(false);
          end();
        }}
      />
    </>
  );
}
