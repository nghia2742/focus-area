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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="glass-deep flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl p-9 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-vivid/15">
          <CheckCircleIcon className="size-7 text-accent-vivid" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Session complete
          </h2>
          <p className="font-tabular text-xl font-medium text-accent-vivid">
            {formatDurationCompact(durationSec)}
          </p>
          <p className="text-sm text-white/55">Nice work.</p>
        </div>
        <Button className="mt-1 w-full rounded-full py-6" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
