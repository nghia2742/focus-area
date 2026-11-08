"use client";

import { ClockIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/timer/format";

interface ActiveSessionRestoreProps {
  open: boolean;
  taskName: string;
  elapsedSec: number;
  paused: boolean;
  onResume: () => void;
  onEnd: () => void;
}

/** Shown after a refresh / browser close when an active session was restored. */
export function ActiveSessionRestore({
  open,
  taskName,
  elapsedSec,
  paused,
  onResume,
  onEnd,
}: ActiveSessionRestoreProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {paused ? "Paused session" : "Welcome back."}
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span>You have an active focus session.</span>
            <span className="flex items-center gap-2 text-foreground">
              <ClockIcon className="size-4 text-muted-foreground" />
              <span className="truncate">{taskName}</span>
              <span className="font-tabular font-semibold">
                {formatClock(elapsedSec)}
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" className="rounded-full" onClick={onEnd}>
            End Session
          </Button>
          <Button className="rounded-full" onClick={onResume}>
            Resume Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
