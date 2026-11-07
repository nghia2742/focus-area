"use client";

import { useState } from "react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { FocusTimer } from "@/components/focus/FocusTimer";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SetupLayer } from "@/components/home/SetupLayer";
import { FocusRail } from "@/components/home/FocusRail";
import { ZenFade } from "@/components/home/ZenFade";
import { MainBackground } from "@/components/media/MainBackground";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The single page of the app. The room artwork always fills the screen; the
 * setup chrome (CTA + sheet) swaps to the inline timer when a session is
 * active — the session never leaves the main screen. The navbar and the
 * top-right rail persist throughout and share the Zen Mode fade.
 */
export function HomeView() {
  const session = useFocusStore((s) => s.session);
  const hydrated = useFocusStore((s) => s.hydrated);
  const [completed, setCompleted] = useState<{ durationSec: number } | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-12">
        <Skeleton className="h-9 w-48" />
        <div className="ml-auto flex flex-col items-center gap-1.5 pr-3 pt-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    );
  }

  const handleComplete = (record: FocusSession) => {
    setCompleted({ durationSec: record.actualDuration });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MainBackground />
      <ZenFade>
        <SiteHeader />
      </ZenFade>
      <ZenFade>
        <FocusRail />
      </ZenFade>
      {session ? <FocusTimer onComplete={handleComplete} /> : <SetupLayer />}

      {completed && (
        <SessionComplete
          durationSec={completed.durationSec}
          onDone={() => setCompleted(null)}
        />
      )}
    </div>
  );
}
