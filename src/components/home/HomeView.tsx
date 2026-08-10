"use client";

import { useState } from "react";
import type { FocusSession } from "@/types/focus";
import { useFocusStore } from "@/store/focusStore";
import { FocusSetup } from "@/components/focus/FocusSetup";
import { FocusScreen } from "@/components/focus/FocusScreen";
import { SessionComplete } from "@/components/focus/SessionComplete";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The single page of the app. Shows the focus screen whenever a session is
 * active, otherwise the setup form. History and Settings live in dialogs.
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
