"use client";

import { CheckCircleIcon } from "lucide-react";
import { formatDurationCompact } from "@/lib/timer/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionCompleteProps {
  durationSec: number;
  onDone: () => void;
}

export function SessionComplete({ durationSec, onDone }: SessionCompleteProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 backdrop-blur-sm"
        className="glass-deep flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl p-9 text-center text-white ring-0 shadow-none sm:max-w-sm"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-vivid/15">
          <CheckCircleIcon className="size-7 text-accent-vivid" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="font-sans text-2xl font-semibold tracking-tight text-white">
            Session complete
          </DialogTitle>
          <p className="font-tabular text-xl font-medium text-accent-vivid">
            {formatDurationCompact(durationSec)}
          </p>
          <DialogDescription className="text-sm text-white/55">
            Nice work.
          </DialogDescription>
        </div>
        <Button className="mt-1 w-full rounded-full py-6" onClick={onDone}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
