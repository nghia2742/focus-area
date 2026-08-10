import type { ActiveSession, ActiveSessionStatus, FocusConfig, FocusSession } from "@/types/focus";
import { DEFAULT_TASK_NAME } from "@/types/focus";

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Pure timer engine. No React, no DOM — every value is derived from
 * timestamps so the timer never drifts across tab sleep, throttling or refresh.
 */

export function createSession(config: FocusConfig, now: number): ActiveSession {
  return {
    id: createSessionId(),
    taskName: config.taskName.trim() || DEFAULT_TASK_NAME,
    mode: config.mode,
    targetDuration: config.targetDuration,
    status: "running",
    startedAt: now,
    pausedAt: null,
    totalPausedDuration: 0,
    overtimeSince: null,
    musicId: config.musicId,
    backgroundId: config.backgroundId,
    createdAt: now,
  };
}

/** Paused time is excluded from actual duration. */
export function getElapsedMs(session: ActiveSession, now: number): number {
  let elapsed = now - session.startedAt - session.totalPausedDuration;
  if (session.status === "paused" && session.pausedAt != null) {
    elapsed -= now - session.pausedAt;
  }
  return Math.max(0, elapsed);
}

export function getActualDurationSec(session: ActiveSession, now: number): number {
  return Math.floor(getElapsedMs(session, now) / 1000);
}

export function getRemainingMs(session: ActiveSession, now: number): number {
  if (session.mode !== "target" || session.targetDuration == null) return 0;
  return Math.max(0, session.targetDuration * 1000 - getElapsedMs(session, now));
}

export function getRemainingSec(session: ActiveSession, now: number): number {
  return Math.ceil(getRemainingMs(session, now) / 1000);
}

/** Once the countdown hits zero while running, the state becomes target_reached. */
export function getDerivedStatus(session: ActiveSession, now: number): ActiveSessionStatus {
  if (
    session.status === "running" &&
    session.mode === "target" &&
    session.targetDuration != null &&
    getElapsedMs(session, now) >= session.targetDuration * 1000
  ) {
    return "target_reached";
  }
  return session.status;
}

export function getOvertimeMs(session: ActiveSession, now: number): number {
  if (session.overtimeSince == null) return 0;
  return Math.max(0, now - session.overtimeSince);
}

export function getOvertimeSec(session: ActiveSession, now: number): number {
  return Math.floor(getOvertimeMs(session, now) / 1000);
}

/** No-op when the session is not running (double-pause guard). */
export function pauseSession(session: ActiveSession, now: number): ActiveSession {
  if (session.status !== "running") return session;
  return { ...session, status: "paused", pausedAt: now };
}

/** No-op when the session is not paused (double-resume guard). */
export function resumeSession(session: ActiveSession, now: number): ActiveSession {
  if (session.status !== "paused" || session.pausedAt == null) return session;
  const totalPausedDuration = session.totalPausedDuration + (now - session.pausedAt);
  const resumed: ActiveSession = {
    ...session,
    status: "running",
    pausedAt: null,
    totalPausedDuration,
  };
  // If the target elapsed while paused/away, surface the reached state.
  return getDerivedStatus(resumed, now) === "target_reached"
    ? { ...resumed, status: "target_reached" }
    : resumed;
}

/** From target_reached, the user chooses to keep going — enter overtime. */
export function enterOvertime(session: ActiveSession, now: number): ActiveSession {
  if (session.mode !== "target") return session;
  return { ...session, status: "overtime", overtimeSince: session.overtimeSince ?? now };
}

/** Build the persisted FocusSession record at completion time. */
export function completeSession(session: ActiveSession, now: number): FocusSession {
  return {
    id: session.id,
    taskName: session.taskName,
    mode: session.mode,
    targetDuration: session.targetDuration,
    actualDuration: getActualDurationSec(session, now),
    startedAt: session.startedAt,
    endedAt: now,
    status: "completed",
    musicId: session.musicId,
    backgroundId: session.backgroundId,
    createdAt: session.createdAt,
  };
}

export function isRunning(session: ActiveSession, now: number): boolean {
  return getDerivedStatus(session, now) === "running";
}
