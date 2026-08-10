"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import type { FocusSession } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { useFocusStore } from "@/store/focusStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { getBackground } from "@/data/backgrounds";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { notifyTargetReached } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BackgroundRenderer } from "@/components/media/BackgroundRenderer";
import { MusicPlayer } from "@/components/media/MusicPlayer";
import { EnvironmentSelector } from "@/components/media/EnvironmentSelector";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TargetReached } from "@/components/focus/TargetReached";
import { EndConfirmDialog } from "@/components/focus/EndConfirmDialog";
import { ActiveSessionRestore } from "@/components/focus/ActiveSessionRestore";

interface FocusScreenProps {
  onComplete?: (record: FocusSession) => void;
}

export function FocusScreen({ onComplete }: FocusScreenProps) {
  const session = useFocusStore((s) => s.session);
  const startedLocally = useFocusStore((s) => s.startedLocally);
  const hydrated = useFocusStore((s) => s.hydrated);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const enterOvertime = useFocusStore((s) => s.enterOvertime);
  const complete = useFocusStore((s) => s.complete);
  const setEnvironment = useFocusStore((s) => s.setEnvironment);

  const { status, elapsedSec } = useFocusTimer();
  const settings = useSettingsStore((s) => s.settings);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  const notifiedFor = useRef<string | null>(null);

  /* Show the restore dialog for a persisted session not started this view. */
  const showRestore =
    hydrated && !!session && !startedLocally && !restoreDismissed;

  /* Re-attach audio (volume + restored track) after a refresh/close. */
  useEffect(() => {
    if (!hydrated || !session || startedLocally) return;
    musicPlayer.setVolume(settings.musicVolume);
    if (session.musicId) void musicPlayer.setTrack(session.musicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, session?.id]);

  /* Fire a browser notification when the target is reached (once per session). */
  useEffect(() => {
    if (status !== "target_reached" || !session) return;
    if (notifiedFor.current === session.id) return;
    notifiedFor.current = session.id;
    notifyTargetReached(session.targetDuration ?? 0);
  }, [status, session]);

  /* Keyboard: Space / K toggles pause-resume when nothing is open. */
  const modalOpen = showEndConfirm || showRestore || showTrackPicker;
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
    return <div className="flex-1 w-full bg-background" />;
  }
  if (!session) return null;

  const isPaused = status === "paused";
  const background = getBackground(session.backgroundId);
  const taskName = session.taskName;
  const currentEnvironmentId =
    ENVIRONMENTS.find((e) => e.musicId && e.musicId === session.musicId)?.id ?? "quiet";

  const handleEndSession = () => {
    setShowEndConfirm(false);
    const record = complete();
    if (record) {
      onComplete?.(record);
    }
    musicPlayer.stop();
  };

  const handleKeepFocusing = () => {
    setShowEndConfirm(false);
  };

  const handleRestoreResume = () => {
    setRestoreDismissed(true);
    if (session.musicId) {
      void musicPlayer.setTrack(session.musicId);
      void musicPlayer.play();
    }
    resume();
  };

  const handleRestoreEnd = () => {
    setRestoreDismissed(true);
    setShowEndConfirm(true);
  };

  const handleEnvironmentChange = (id: string) => {
    const env = getEnvironment(id);
    const musicId = env?.musicId;
    const backgroundId = env?.backgroundId;
    if (musicId) {
      void musicPlayer.setTrack(musicId);
      void musicPlayer.play();
    } else {
      musicPlayer.stop();
    }
    setEnvironment({ musicId, backgroundId });
    if (settings.rememberLastEnvironment) {
      useSettingsStore.getState().update({ lastEnvironmentId: id });
    }
    setShowTrackPicker(false);
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-[oklch(0.14_0.012_60)] text-[oklch(0.95_0.012_70)]">
      <BackgroundRenderer background={background} />

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
          <div className="flex flex-col items-center gap-4">
            <MusicPlayer
              onOpenSelector={() => setShowTrackPicker(true)}
              onVolumeChange={(v) => updateVolume(v)}
            />
            <div className="flex items-center gap-3">
              {(status === "running" || status === "paused") && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="glass h-12 rounded-full px-7 text-white/90 hover:bg-white/10 hover:text-white active:scale-[0.98]"
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
                variant="ghost"
                size="lg"
                className="h-12 rounded-full px-6 text-white/45 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                onClick={() => setShowEndConfirm(true)}
              >
                <SquareIcon data-icon="inline-start" />
                End
              </Button>
            </div>
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

      <Dialog open={showTrackPicker} onOpenChange={setShowTrackPicker}>
        <DialogContent className="max-h-[80dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Environment</DialogTitle>
          </DialogHeader>
          <EnvironmentSelector
            value={currentEnvironmentId}
            compact
            onChange={handleEnvironmentChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  function updateVolume(v: number) {
    useSettingsStore.getState().update({ musicVolume: v });
  }
}
