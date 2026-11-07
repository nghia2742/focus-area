"use client";

import type { FocusSession } from "@/types/focus";
import { formatDurationCompact, formatDayGroup, formatTime } from "@/lib/timer/format";
import { Badge } from "@/components/ui/badge";

interface SessionItemProps {
  session: FocusSession;
  now: number;
}

export function SessionItem({ session, now }: SessionItemProps) {
  const modeLabel =
    session.mode === "target" && session.targetDuration
      ? `Target · ${session.targetDuration}m`
      : "Open";

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-medium">{session.taskName}</span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{modeLabel}</Badge>
          <span className="truncate">
            {formatDayGroup(session.startedAt, now)} · {formatTime(session.startedAt)}
          </span>
        </span>
      </div>
      <span className="font-tabular shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
        {formatDurationCompact(session.actualDuration)}
      </span>
    </li>
  );
}
