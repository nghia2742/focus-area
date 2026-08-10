/**
 * Duration/date formatting helpers. Durations are always in whole seconds.
 */

/** Clock-style "MM:SS" or "H:MM:SS" once an hour has passed. */
export function formatTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

/** Always "HH:MM:SS". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

/** Overtime chip like "+08:32" or "+1:05:00". */
export function formatOvertime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `+${formatTimer(s)}`;
}

/** Compact human duration: "1h 27m", "45m", "32s". */
export function formatDurationCompact(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) return `${hours}h ${pad2(minutes)}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/** Stats-friendly: "2h 37m" / "52m". */
export function formatDurationShort(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${pad2(minutes)}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${s}s`;
}

/** "Mon 12" style day label for the weekly chart. */
export function formatDayShort(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/** "10:30 AM" style time. */
export function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Grouping label: "Today", "Yesterday", or a date. */
export function formatDayGroup(epochMs: number, now: number): string {
  const d = startOfDay(epochMs);
  const today = startOfDay(now);
  const yesterday = today - 86_400_000;
  if (d === today) return "Today";
  if (d === yesterday) return "Yesterday";
  return new Date(epochMs).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function startOfDay(epochMs: number): number {
  const d = new Date(epochMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfWeek(epochMs: number): number {
  const d = new Date(epochMs);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
