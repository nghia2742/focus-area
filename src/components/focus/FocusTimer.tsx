"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { notifyTargetReached } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TargetReached } from "@/components/focus/TargetReached";
import { EndConfirmDialog } from "@/components/focus/EndConfirmDialog";
import { ActiveSessionRestore } from "@/components/focus/ActiveSessionRestore";

interface FocusTimerProps {
  onComplete?: (record: FocusSession) => void;
}

/**
 * The active session, rendered inline on the main screen (the room artwork
 * stays behind it) — it does not navigate anywhere. Shows the task name, the
 * timer, and the pause/end controls. No music controls.
 */
export function FocusTimer({ onComplete }: FocusTimerProps) {
  const session = useFocusStore((s) => s.session);
  const startedLocally = useFocusStore((s) => s.startedLocally);
  const hydrated = useFocusStore((s) => s.hydrated);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const enterOvertime = useFocusStore((s) => s.enterOvertime);
  const complete = useFocusStore((s) => s.complete);

  const { status, elapsedSec } = useFocusTimer();

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [restoreDismissed, setRestoreDismissed] = useState(false);

  const notifiedFor = useRef<string | null>(null);

  /* Show the restore dialog for a persisted session not started this view. */
  const showRestore =
    hydrated && !!session && !startedLocally && !restoreDismissed;

  /* Fire a browser notification when the target is reached (once per session). */
  useEffect(() => {
    if (status !== "target_reached" || !session) return;
    if (notifiedFor.current === session.id) return;
    notifiedFor.current = session.id;
    notifyTargetReached(session.targetDuration ?? 0);
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

  if (!hydrated) {
    return <div className="absolute inset-0" />;
  }
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
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-10 px-4 sm:gap-12">
        {taskName && (
          <span className="glass inline-flex max-w-md items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white/90">
            <span className="size-1.5 shrink-0 rounded-full bg-accent-vivid" />
            <span className="truncate">{taskName}</span>
          </span>
        )}

        <TimerDisplay />

        {status === "target_reached" ? (
          <TargetReached
            onFinish={handleEndSession}
            onKeepFocusing={() => enterOvertime()}
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              {(status === "running" || status === "paused") && (
                <Button
                  size="lg"
                  className="h-12 min-w-40 gap-2 rounded-full bg-accent-orange px-7 text-base font-semibold text-accent-orange-foreground shadow-[0_8px_24px_rgba(244,169,79,0.28)] hover:bg-accent-orange-hover active:scale-[0.98]"
                  onClick={() => (isPaused ? resume() : pause())}
                >
                  {isPaused ? (
                    <>
                      <PlayIcon className="size-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="size-5" />
                      Pause
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="lg"
                className="h-12 gap-2 rounded-full border border-red-400/50 bg-red-950/60 px-6 text-base font-medium text-red-100 backdrop-blur-sm hover:border-red-400/70 hover:bg-red-900/70 active:scale-[0.98]"
                onClick={() => setShowEndConfirm(true)}
              >
                <SquareIcon className="size-5" />
                End Session
              </Button>
            </div>
            <span className="hidden text-xs tracking-wide text-white/35 sm:inline">
              Space · pause
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
