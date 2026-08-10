"use client";

import { useState } from "react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { FocusSetup } from "@/components/focus/FocusSetup";
import { FocusScreen } from "@/components/focus/FocusScreen";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The single page of the app. Shows the immersive focus screen whenever a
 * session is active (the header floats above it), otherwise the setup form.
 * History and Settings live in dialogs.
 */
export function HomeView() {
  const session = useFocusStore((s) => s.session);
  const hydrated = useFocusStore((s) => s.hydrated);
  const [completed, setCompleted] = useState<{ durationSec: number } | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-12">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    );
  }

  const handleComplete = (record: FocusSession) => {
    setCompleted({ durationSec: record.actualDuration });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      {!session && <SetupBackground />}
      <SiteHeader overlay={!!session} />
      {session ? <FocusScreen onComplete={handleComplete} /> : <FocusSetup />}

      {completed && (
        <SessionComplete
          durationSec={completed.durationSec}
          onDone={() => setCompleted(null)}
        />
      )}
    </div>
  );
}

/** Full-bleed artwork behind the setup screen (never during a session). */
function SetupBackground() {
  return (
    <div aria-hidden className="absolute inset-0 z-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative background */}
      <img
        src="/setup/main_bg.png"
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[oklch(0.97_0.02_80)]/45 dark:bg-[oklch(0.11_0.025_55)]/60" />
      <div className="ambient-glow absolute inset-0 opacity-70" />
      <div className="noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}
