"use client";

import { useMemo } from "react";
import type { FocusSession } from "@/types/focus";
import { formatDayGroup, startOfDay } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import { SessionItem } from "./SessionItem";

interface SessionListProps {
  sessions: FocusSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  const now = useReferenceNow();

  const groups = useMemo(() => {
    const map = new Map<number, FocusSession[]>();
    for (const s of sessions) {
      const day = startOfDay(s.startedAt);
      const list = map.get(day) ?? [];
      list.push(s);
      map.set(day, list);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [sessions]);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(([day, list]) => (
        <section key={day} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {formatDayGroup(day, now)}
          </h3>
          <ul className="flex flex-col gap-2">
            {list.map((s) => (
              <SessionItem key={s.id} session={s} now={now} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
