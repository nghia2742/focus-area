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
      <DialogContent className="flex max-h-[85dvh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl lg:max-w-6xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
          <DialogTitle>Focus History</DialogTitle>
          <DialogDescription>See what you actually focused on.</DialogDescription>
        </DialogHeader>

        {!hydrated ? (
          <div className="flex flex-col gap-6 px-6 py-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : sessions.length === 0 ? (
          <Empty className="mx-auto max-w-md px-6 py-12">
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
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:overflow-hidden">
            <div className="flex flex-col gap-6 px-6 py-6 lg:min-h-0 lg:overflow-y-auto">
              <FocusStats sessions={sessions} />
              <WeekChart sessions={sessions} />
            </div>
            <div className="flex min-h-0 flex-col gap-3 px-6 py-6">
              <div className="flex shrink-0 items-baseline justify-between gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">Sessions</h2>
                <span className="text-xs text-muted-foreground">
                  {sessions.length} total
                </span>
              </div>
              <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
                <SessionList sessions={sessions} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
