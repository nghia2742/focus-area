"use client";

import { useMemo } from "react";
import { FlameIcon, HourglassIcon, LayersIcon, TargetIcon, TimerIcon, TrophyIcon } from "lucide-react";
import { computeStats } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import type { FocusSession } from "@/types/focus";
import { Card } from "@/components/ui/card";

interface FocusStatsProps {
  sessions: FocusSession[];
}

export function FocusStats({ sessions }: FocusStatsProps) {
  const now = useReferenceNow();
  const stats = useMemo(() => computeStats(sessions, now), [sessions, now]);

  const items = [
    { label: "Today", value: formatDurationShort(stats.today), icon: TimerIcon },
    { label: "Yesterday", value: formatDurationShort(stats.yesterday), icon: HourglassIcon },
    { label: "This week", value: formatDurationShort(stats.week), icon: LayersIcon },
    { label: "Sessions", value: String(stats.count), icon: TargetIcon },
    { label: "Average", value: formatDurationShort(stats.avg), icon: FlameIcon },
    { label: "Longest", value: formatDurationShort(stats.longest), icon: TrophyIcon },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label} className="gap-2 p-4">
          <item.icon className="size-4 text-accent-vivid" aria-hidden />
          <span className="font-tabular text-2xl font-semibold tracking-tight">
            {item.value}
          </span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </Card>
      ))}
    </div>
  );
}
