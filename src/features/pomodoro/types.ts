export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";
export type PomodoroStatus = "running" | "paused" | "awaiting" | "done";

export interface PomodoroConfig {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  roundsPerLongBreak: number;
  totalRounds: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
}

export interface PomodoroState {
  phase: PomodoroPhase;
  /** 1-based focus round. */
  round: number;
  status: PomodoroStatus;
  /** Epoch ms, only while `status === "running"`. */
  endsAt: number | null;
  /** Kept up to date while paused/awaiting. */
  remainingMs: number;
  /** Total focus ms credited when leaving a focus phase. */
  focusMsDone: number;
  /** Focus phases that ran their full duration. */
  roundsCompleted: number;
  /** Epoch ms when the session started. */
  startedAt: number;
  /** Snapshot taken at start; never changes during the session. */
  config: PomodoroConfig;
  task: string;
}

export interface PomodoroHistoryRecord {
  id: string;
  mode: "pomodoro";
  task: string;
  startedAt: number;
  endedAt: number;
  /** Focus time only. */
  durationSec: number;
  roundsCompleted: number;
  roundsPlanned: number;
}
