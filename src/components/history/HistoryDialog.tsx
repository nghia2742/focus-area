"use client";

import { CalendarClockIcon } from "lucide-react";
import { useHistoryStore } from "@/store/historyStore";
import { FocusStats } from "./FocusStats";
import { WeekChart } from "./WeekChart";
import { SessionList } from "./SessionList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const sessions = useHistoryStore((s) => s.sessions);
  const hydrated = useHistoryStore((s) => s.hydrated);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] w-full overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Focus History</DialogTitle>
          <DialogDescription>See what you actually focused on.</DialogDescription>
        </DialogHeader>

        {!hydrated ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : sessions.length === 0 ? (
          <Empty className="mx-auto max-w-md py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>No sessions yet</EmptyTitle>
              <EmptyDescription>
                Complete your first focus session and it will show up here.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => onOpenChange(false)}>Start focusing</Button>
          </Empty>
        ) : (
          <div className="flex flex-col gap-6">
            <FocusStats sessions={sessions} />
            <WeekChart sessions={sessions} />
            <SessionList sessions={sessions} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
