"use client";

import { useMemo } from "react";
import { computeStats } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import type { FocusSession } from "@/types/focus";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FocusStatsProps {
  sessions: FocusSession[];
}

export function FocusStats({ sessions }: FocusStatsProps) {
  const now = useReferenceNow();
  const stats = useMemo(() => computeStats(sessions, now), [sessions, now]);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Focus today</CardDescription>
        <CardTitle className="font-tabular text-5xl font-semibold tracking-tight">
          {formatDurationShort(stats.today)}
        </CardTitle>
        <CardDescription>
          Yesterday · {formatDurationShort(stats.yesterday)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="This week" value={formatDurationShort(stats.week)} />
          <Stat label="Sessions" value={String(stats.count)} />
          <Stat label="Average" value={formatDurationShort(stats.avg)} />
          <Stat label="Longest" value={formatDurationShort(stats.longest)} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-tabular text-lg font-semibold tracking-tight">{value}</dd>
    </div>
  );
}
