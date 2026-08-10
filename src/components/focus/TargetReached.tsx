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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="glass-deep flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-vivid/15">
          <SparklesIcon className="size-6 text-accent-vivid" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-white">Target reached</h2>
          <p className="text-sm text-white/60">
            You&apos;ve focused for {formatDurationCompact(elapsedSec)}.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            className="flex-1 rounded-full py-6 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={onFinish}
          >
            Finish Session
          </Button>
          <Button className="flex-1 rounded-full py-6" onClick={onKeepFocusing}>
            Keep Focusing
          </Button>
        </div>
      </div>
    </div>
  );
}
