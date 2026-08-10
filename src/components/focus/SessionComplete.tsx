"use client";

import { CheckCircleIcon } from "lucide-react";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";

interface SessionCompleteProps {
  durationSec: number;
  onDone: () => void;
}

export function SessionComplete({ durationSec, onDone }: SessionCompleteProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="glass flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center">
        <CheckCircleIcon className="size-10 text-accent-vivid" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Session complete</h2>
          <p className="font-tabular text-lg font-medium">
            {formatDurationCompact(durationSec)}
          </p>
          <p className="text-sm text-muted-foreground">Nice work.</p>
        </div>
        <Button className="w-full" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
