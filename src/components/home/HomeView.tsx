"use client";

import { useState } from "react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { FocusSetup } from "@/components/focus/FocusSetup";
import { FocusScreen } from "@/components/focus/FocusScreen";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MainBackground } from "@/components/media/MainBackground";
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
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
  return <MainBackground />;
}
