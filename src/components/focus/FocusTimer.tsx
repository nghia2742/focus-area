"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { notifyTargetReached } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TargetReached } from "@/components/focus/TargetReached";
import { EndConfirmDialog } from "@/components/focus/EndConfirmDialog";
import { ActiveSessionRestore } from "@/components/focus/ActiveSessionRestore";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";

interface FocusTimerProps {
  onComplete?: (record: FocusSession) => void;
}

/**
 * The active session, rendered inline on the main screen (the room artwork
 * stays behind it). Pomodoro sessions run their own phase machine; every other
 * mode uses the plain timestamp timer below.
 */
export function FocusTimer({ onComplete }: FocusTimerProps) {
  const session = useFocusStore((s) => s.session);
  const hydrated = useFocusStore((s) => s.hydrated);

  if (!hydrated) return <div className="absolute inset-0" />;
  if (!session) return null;
  if (session.mode === "pomodoro" && session.pomodoro) {
    return <PomodoroTimer onComplete={onComplete} />;
  }
  return <StandardFocusTimer onComplete={onComplete} />;
}

/** Open/Target timer screen. Shows the task, the timer and the pause/end controls. */
function StandardFocusTimer({ onComplete }: FocusTimerProps) {
  const session = useFocusStore((s) => s.session);
  const startedLocally = useFocusStore((s) => s.startedLocally);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const enterOvertime = useFocusStore((s) => s.enterOvertime);
  const complete = useFocusStore((s) => s.complete);

  const { status, elapsedSec } = useFocusTimer();

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [restoreDismissed, setRestoreDismissed] = useState(false);

  const notifiedFor = useRef<string | null>(null);

  /* Show the restore dialog for a persisted session not started this view. */
  const showRestore = !!session && !startedLocally && !restoreDismissed;

  /* Fire a browser notification when the target is reached (once per session). */
  useEffect(() => {
    if (status !== "target_reached" || !session) return;
    if (notifiedFor.current === session.id) return;
    notifiedFor.current = session.id;
    notifyTargetReached(session.targetDuration ?? 0, session.completionMessage);
  }, [status, session]);

  /* Keyboard: Space / K toggles pause-resume when nothing is open. */
  const modalOpen = showEndConfirm || showRestore;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.key !== " " && e.key.toLowerCase() !== "k") return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }
      if (e.key === " ") e.preventDefault();
      if (status === "running" || status === "paused") {
        if (status === "paused") resume();
        else pause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, status, pause, resume]);

  if (!session) return null;

  const isPaused = status === "paused";
  const taskName = session.taskName;

  const handleEndSession = () => {
    setShowEndConfirm(false);
    const record = complete();
    if (record) {
      onComplete?.(record);
    }
  };

  const handleKeepFocusing = () => {
    setShowEndConfirm(false);
  };

  const handleRestoreResume = () => {
    setRestoreDismissed(true);
    resume();
  };

  const handleRestoreEnd = () => {
    setRestoreDismissed(true);
    handleEndSession();
  };

  return (
    <>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-10 px-4 sm:gap-14">
        {taskName && (
          <p className="max-w-md truncate text-sm text-artwork-ink-muted">{taskName}</p>
        )}

        <TimerDisplay />

        {status === "target_reached" ? (
          <TargetReached
            onFinish={handleEndSession}
            onKeepFocusing={() => enterOvertime()}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              {(status === "running" || status === "paused") && (
                <Button
                  size="xl"
                  className="min-w-40 rounded-full"
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
              )}
              <Button
                variant="destructive"
                size="xl"
                className="rounded-full"
                onClick={() => setShowEndConfirm(true)}
              >
                <SquareIcon data-icon="inline-start" />
                End Session
              </Button>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-artwork-ink-muted sm:inline-flex">
              <Kbd className="bg-artwork-veil text-artwork-ink">Space</Kbd>{" "}
              to pause or resume
            </span>
          </div>
        )}
      </div>

      <EndConfirmDialog
        open={showEndConfirm}
        onOpenChange={setShowEndConfirm}
        elapsedSec={elapsedSec}
        onKeepFocusing={handleKeepFocusing}
        onEndSession={handleEndSession}
      />

      <ActiveSessionRestore
        open={showRestore}
        taskName={taskName ?? "Focus Session"}
        elapsedSec={elapsedSec}
        paused={isPaused}
        onResume={handleRestoreResume}
        onEnd={handleRestoreEnd}
      />
    </>
  );
}
