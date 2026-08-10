"use client";

import { useMemo } from "react";
import type { FocusSession } from "@/types/focus";
import { lastNDays } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WeekChartProps {
  sessions: FocusSession[];
}

export function WeekChart({ sessions }: WeekChartProps) {
  const now = useReferenceNow();
  const days = useMemo(() => lastNDays(7, sessions, now), [sessions, now]);
  const max = Math.max(...days.map((d) => d.seconds), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-36 items-end gap-2 sm:gap-3">
          {days.map((d) => {
            const pct = Math.max(4, (d.seconds / max) * 100);
            return (
              <Tooltip key={d.day}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${d.label}: ${formatDurationShort(d.seconds)} of focus`}
                    className="group/bar flex h-full flex-1 cursor-default flex-col items-center justify-end gap-1.5 rounded-md border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="w-full rounded-lg bg-accent-vivid/70 transition-colors group-hover/bar:bg-accent-vivid"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {d.label} · {formatDurationShort(d.seconds)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
