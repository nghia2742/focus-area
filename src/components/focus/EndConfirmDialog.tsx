"use client";

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

interface EndConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elapsedSec: number;
  onKeepFocusing: () => void;
  onEndSession: () => void;
}

export function EndConfirmDialog({
  open,
  onOpenChange,
  elapsedSec,
  onKeepFocusing,
  onEndSession,
}: EndConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>End focus session?</DialogTitle>
          <DialogDescription>
            You&apos;ve focused for{" "}
            <span className="font-tabular font-semibold text-foreground">
              {formatClock(elapsedSec)}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onKeepFocusing}>
            Keep Focusing
          </Button>
          <Button onClick={onEndSession}>End Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
