"use client";

import { useMemo } from "react";
import {
  CalendarDaysIcon,
  FlameIcon,
  LayersIcon,
  TimerIcon,
  TrophyIcon,
} from "lucide-react";
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

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <Card className="gap-3 bg-gradient-to-br from-accent-vivid/15 via-accent-vivid/5 to-transparent p-5 ring-accent-vivid/20 sm:col-span-2 sm:row-span-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-vivid/15">
          <TimerIcon className="size-4 text-accent-vivid" aria-hidden />
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-accent-foreground uppercase">
            Focus today
          </span>
          <span className="font-tabular text-5xl font-semibold tracking-tight">
            {formatDurationShort(stats.today)}
          </span>
          <span className="text-sm text-muted-foreground">
            Yesterday · {formatDurationShort(stats.yesterday)}
          </span>
        </span>
      </Card>

      <StatTile
        label="This week"
        value={formatDurationShort(stats.week)}
        icon={LayersIcon}
      />
      <StatTile
        label="Sessions"
        value={String(stats.count)}
        icon={CalendarDaysIcon}
      />
      <StatTile
        label="Average"
        value={formatDurationShort(stats.avg)}
        icon={FlameIcon}
      />
      <StatTile
        label="Longest"
        value={formatDurationShort(stats.longest)}
        icon={TrophyIcon}
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FlameIcon;
}) {
  return (
    <Card className="gap-2 p-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-tabular text-xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    </Card>
  );
}
