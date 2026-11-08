import type { FocusSession } from "@/types/focus";
import { formatDayShort, startOfDay, startOfWeek } from "@/lib/timer/format";

export interface FocusStats {
  today: number;
  yesterday: number;
  week: number;
  count: number;
  avg: number;
  longest: number;
}

export function computeStats(sessions: FocusSession[], now: number): FocusStats {
  const todayStart = startOfDay(now);
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = startOfWeek(now);

  let today = 0;
  let yesterday = 0;
  let week = 0;
  let longest = 0;

  for (const s of sessions) {
    const day = startOfDay(s.startedAt);
    if (day === todayStart) today += s.actualDuration;
    if (day === yesterdayStart) yesterday += s.actualDuration;
    if (day >= weekStart) week += s.actualDuration;
    if (s.actualDuration > longest) longest = s.actualDuration;
  }

  const count = sessions.length;

  return {
    today,
    yesterday,
    week,
    count,
    avg: count > 0 ? Math.round(sum(sessions) / count) : 0,
    longest,
  };
}

function sum(sessions: FocusSession[]): number {
  return sessions.reduce((acc, s) => acc + s.actualDuration, 0);
}

export interface DayBucket {
  day: number;
  label: string;
  isToday: boolean;
  /** Focus seconds per mode, so the weekly chart can stack by mode. */
  open: number;
  target: number;
  pomodoro: number;
}

/** Trailing `n` calendar days ending today, oldest first, split by focus mode. */
export function lastNDays(n: number, sessions: FocusSession[], now: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const todayStart = startOfDay(now);

  for (let i = n - 1; i >= 0; i--) {
    const day = todayStart - i * 86_400_000;
    buckets.push({
      day,
      label: formatDayShort(new Date(day)),
      isToday: day === todayStart,
      open: 0,
      target: 0,
      pomodoro: 0,
    });
  }

  for (const s of sessions) {
    const day = startOfDay(s.startedAt);
    const bucket = buckets.find((b) => b.day === day);
    if (bucket) bucket[s.mode] += s.actualDuration;
  }

  return buckets;
}
