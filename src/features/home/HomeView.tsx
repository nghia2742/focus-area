"use client";

import { useState } from "react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { FocusTimer } from "@/features/focus/FocusTimer";
import { SessionComplete } from "@/features/focus/SessionComplete";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SetupLayer } from "@/features/home/SetupLayer";
import { ZenFade } from "@/components/layout/ZenFade";
import { MainBackground } from "@/components/media/MainBackground";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The single page of the app. The room artwork always fills the screen; the
 * setup chrome (CTA + sheet) swaps to the inline timer when a session is
 * active — the session never leaves the main screen. The navbar (including the
 * Zen Mode toggle) persists throughout and fades with Zen Mode.
 */
export function HomeView() {
  const session = useFocusStore((s) => s.session);
  const hydrated = useFocusStore((s) => s.hydrated);
  const [completed, setCompleted] = useState<{
    durationSec: number;
    targetDuration?: number;
    roundsCompleted?: number;
    roundsPlanned?: number;
  } | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-12">
        <Skeleton className="h-9 w-48" />
        <div className="ml-auto flex items-center gap-1.5 pr-3">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    );
  }

  const handleComplete = (record: FocusSession) => {
    setCompleted({
      durationSec: record.actualDuration,
      targetDuration: record.targetDuration,
      roundsCompleted: record.roundsCompleted,
      roundsPlanned: record.roundsPlanned,
    });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MainBackground />
      <ZenFade>
        <SiteHeader />
      </ZenFade>
      {session ? <FocusTimer onComplete={handleComplete} /> : <SetupLayer />}

      {completed && (
        <SessionComplete
          durationSec={completed.durationSec}
          targetDuration={completed.targetDuration}
          roundsCompleted={completed.roundsCompleted}
          roundsPlanned={completed.roundsPlanned}
          onDone={() => setCompleted(null)}
        />
      )}
    </div>
  );
}
