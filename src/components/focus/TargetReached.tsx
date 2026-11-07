"use client";

import { SparklesIcon } from "lucide-react";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface TargetReachedProps {
  onFinish: () => void;
  onKeepFocusing: () => void;
}

export function TargetReached({ onFinish, onKeepFocusing }: TargetReachedProps) {
  const { elapsedSec } = useFocusTimer();

  return (
    <Dialog open onOpenChange={(open) => !open && onKeepFocusing()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50 backdrop-blur-sm"
        className="glass-deep flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl p-8 text-center text-white ring-0 shadow-none sm:max-w-sm"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onKeepFocusing();
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-vivid/15">
          <SparklesIcon className="size-6 text-accent-vivid" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="font-sans text-xl font-semibold tracking-tight text-white">
            Target reached
          </DialogTitle>
          <DialogDescription className="text-sm text-white/60">
            You&apos;ve focused for {formatDurationCompact(elapsedSec)}.
          </DialogDescription>
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
      </DialogContent>
    </Dialog>
  );
}
