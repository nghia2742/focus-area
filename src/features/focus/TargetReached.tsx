"use client";

import { SparklesIcon } from "lucide-react";
import { useFocusTimer } from "@/hooks/useFocusTimer";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
        className="gap-6 items-center p-8 text-center"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onKeepFocusing();
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <span className="flex size-12 justify-self-center items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SparklesIcon className="size-6" aria-hidden />
        </span>
        <DialogHeader className="items-center gap-1.5">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Target reached
          </DialogTitle>
          <DialogDescription>
            You&apos;ve focused for {formatDurationCompact(elapsedSec)}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onFinish}>
            Finish Session
          </Button>
          <Button className="flex-1" onClick={onKeepFocusing}>
            Keep Focusing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
