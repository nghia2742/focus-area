import type { PomodoroConfig, PomodoroPhase, PomodoroState } from "./types";

/**
 * Pure Pomodoro state machine. No React, no DOM, no `Date.now()` inside —
 * callers pass `now` so every transition is deterministic and testable.
 */

export const phaseMs = (phase: PomodoroPhase, c: PomodoroConfig): number =>
  (phase === "focus" ? c.focusMin : phase === "shortBreak" ? c.shortBreakMin : c.longBreakMin) *
  60_000;

export function nextPhase(
  phase: PomodoroPhase,
  round: number,
  c: PomodoroConfig,
): { phase: PomodoroPhase; round: number } | "done" {
  if (phase === "focus") {
    if (round >= c.totalRounds) return "done";
    return round % c.roundsPerLongBreak === 0
      ? { phase: "longBreak", round }
      : { phase: "shortBreak", round };
  }
  return { phase: "focus", round: round + 1 };
}

function remaining(s: PomodoroState, now: number): number {
  return s.status === "running" ? Math.max(0, (s.endsAt ?? now) - now) : s.remainingMs;
}

function focusCredit(s: PomodoroState, now: number): number {
  return s.phase === "focus" ? phaseMs("focus", s.config) - remaining(s, now) : 0;
}

function autoStarts(phase: PomodoroPhase, c: PomodoroConfig): boolean {
  return phase === "focus" ? c.autoStartFocus : c.autoStartBreak;
}

function enter(
  s: PomodoroState,
  next: { phase: PomodoroPhase; round: number },
  focusMsDone: number,
  roundsCompleted: number,
  now: number,
  forceAwaiting: boolean,
): PomodoroState {
  const ms = phaseMs(next.phase, s.config);
  const running = !forceAwaiting && autoStarts(next.phase, s.config);
  return {
    ...s,
    phase: next.phase,
    round: next.round,
    status: running ? "running" : "awaiting",
    endsAt: running ? now + ms : null,
    remainingMs: ms,
    focusMsDone,
    roundsCompleted,
  };
}

export function start(config: PomodoroConfig, task: string, now: number): PomodoroState {
  const ms = phaseMs("focus", config);
  return {
    phase: "focus",
    round: 1,
    status: "running",
    endsAt: now + ms,
    remainingMs: ms,
    focusMsDone: 0,
    roundsCompleted: 0,
    startedAt: now,
    config,
    task,
  };
}

export function pause(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== "running") return s;
  return {
    ...s,
    status: "paused",
    remainingMs: remaining(s, now),
    endsAt: null,
  };
}

export function resume(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== "paused") return s;
  return {
    ...s,
    status: "running",
    endsAt: now + s.remainingMs,
  };
}

/** Tick hit zero: credit the full phase, move on, auto-start per the destination phase. */
export function complete(
  s: PomodoroState,
  now: number,
  forceAwaiting = false,
): PomodoroState {
  if (s.status !== "running") return s;
  const rem = remaining(s, now);
  if (rem > 0) return s;

  const next = nextPhase(s.phase, s.round, s.config);
  const focusMsDone = s.focusMsDone + focusCredit(s, now);
  const roundsCompleted = s.roundsCompleted + (s.phase === "focus" ? 1 : 0);

  if (next === "done") {
    return {
      ...s,
      status: "done",
      endsAt: null,
      remainingMs: 0,
      focusMsDone,
      roundsCompleted,
    };
  }
  return enter(s, next, focusMsDone, roundsCompleted, now, forceAwaiting);
}

/** Move on early: credit the time actually run, but never count the round as completed. */
export function skip(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== "running" && s.status !== "paused") return s;

  const next = nextPhase(s.phase, s.round, s.config);
  const focusMsDone = s.focusMsDone + focusCredit(s, now);

  if (next === "done") {
    return {
      ...s,
      status: "done",
      endsAt: null,
      remainingMs: 0,
      focusMsDone,
    };
  }
  return enter(s, next, focusMsDone, s.roundsCompleted, now, false);
}

/** Start the phase the session is waiting on. */
export function startNext(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== "awaiting") return s;
  const ms = phaseMs(s.phase, s.config);
  return { ...s, status: "running", endsAt: now + ms, remainingMs: ms };
}

/** End the session immediately; credits the current focus phase only. */
export function end(s: PomodoroState, now: number): PomodoroState {
  if (s.status === "done") return s;
  return {
    ...s,
    status: "done",
    endsAt: null,
    remainingMs: 0,
    focusMsDone: s.focusMsDone + focusCredit(s, now),
  };
}

/**
 * After a reload: finish at most one phase that ended while away, then wait.
 * Never auto-runs the next phase, even when its auto-start flag is on.
 */
export function restore(s: PomodoroState, now: number): PomodoroState {
  if (s.status !== "running" || s.endsAt == null || now < s.endsAt) return s;
  return complete(s, s.endsAt, true);
}
