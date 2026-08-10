"use client";

import { SparklesIcon } from "lucide-react";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";

interface TargetReachedProps {
  onFinish: () => void;
  onKeepFocusing: () => void;
}

export function TargetReached({ onFinish, onKeepFocusing }: TargetReachedProps) {
  const { elapsedSec } = useFocusTimer();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-4">
      <div className="glass flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl p-6 text-center">
        <SparklesIcon className="size-8 text-accent-vivid" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Target reached</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;ve focused for {formatDurationCompact(elapsedSec)}.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onFinish}>
            Finish Session
          </Button>
          <Button className="flex-1" onClick={onKeepFocusing}>
            Keep Focusing
          </Button>
        </div>
      </div>
    </div>
  );
}
