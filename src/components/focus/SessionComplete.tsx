"use client";

import { CheckCircleIcon } from "lucide-react";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionCompleteProps {
  durationSec: number;
  targetDuration?: number;
  /** Pomodoro sessions: rounds that ran their full focus duration. */
  roundsCompleted?: number;
  /** Pomodoro sessions: rounds planned at start. */
  roundsPlanned?: number;
  onDone: () => void;
}

export function SessionComplete({
  durationSec,
  targetDuration,
  roundsCompleted,
  roundsPlanned,
  onDone,
}: SessionCompleteProps) {
  const isPomodoro = roundsPlanned != null;
  const targetSec = targetDuration ? targetDuration * 60 : 0;
  const overtimeSec = targetSec ? Math.max(0, durationSec - targetSec) : 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent
        showCloseButton={false}
        className="gap-6 items-center p-8 text-center"
      >
        <span className="flex size-14 justify-self-center items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircleIcon className="size-7" aria-hidden />
        </span>
        <DialogHeader className="items-center gap-1.5">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isPomodoro
              ? `Completed ${roundsCompleted ?? 0}/${roundsPlanned} rounds`
              : "Session complete"}
          </DialogTitle>
          <p className="font-tabular text-xl font-medium text-primary">
            {formatDurationCompact(durationSec)}
          </p>
          <DialogDescription>
            {isPomodoro
              ? `Total focus time: ${formatDurationCompact(durationSec)}`
              : overtimeSec > 0
                ? `${formatDurationCompact(targetSec)} target + ${formatDurationCompact(overtimeSec)} overtime`
                : "Nice work."}
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full" onClick={onDone}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
