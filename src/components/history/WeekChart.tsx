"use client";

import { useMemo } from "react";
import type { FocusSession } from "@/types/focus";
import { lastNDays } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import { cn } from "@/lib/utils";
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
        <div className="flex h-40 items-end gap-2 sm:gap-3">
          {days.map((d) => {
            const pct = Math.max(5, (d.seconds / max) * 100);
            return (
              <Tooltip key={d.day}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${d.label}: ${formatDurationShort(d.seconds)} of focus`}
                    className="group/bar flex h-full flex-1 cursor-default flex-col items-center justify-end gap-2 rounded-xl border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="w-full rounded-full bg-gradient-to-t from-accent-vivid/90 to-accent-vivid/40 transition-all duration-300 group-hover/bar:from-accent-vivid group-hover/bar:to-accent-vivid"
                      style={{ height: `${pct}%` }}
                    />
                    <span
                      className={cn(
                        "text-xs",
                        d.isToday ? "font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {d.label}
                    </span>
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
