import type { PomodoroConfig, PomodoroState } from "@/features/pomodoro/types";

export type FocusMode = "open" | "target" | "pomodoro";

/** Status of a persisted, completed focus session. */
export type SessionStatus = "completed" | "cancelled";

/** Live status of the active (in-progress) session. */
export type ActiveSessionStatus = "running" | "paused" | "target_reached" | "overtime";

/** A completed focus session stored in history. */
export interface FocusSession {
  id: string;
  taskName: string;
  mode: FocusMode;
  /** Target duration in minutes (target mode only). */
  targetDuration?: number;
  /** Actual focused duration in seconds (pauses excluded). */
  actualDuration: number;
  /** Epoch ms when the session started. */
  startedAt: number;
  /** Epoch ms when the session ended. */
  endedAt: number;
  status: SessionStatus;
  musicId?: string;
  backgroundId?: string;
  /** Pomodoro sessions only: rounds that ran their full focus duration. */
  roundsCompleted?: number;
  /** Pomodoro sessions only: rounds planned at start. */
  roundsPlanned?: number;
  /** Epoch ms when the record was created. */
  createdAt: number;
}

/**
 * The in-progress session. This is the persisted "source of truth" the UI
 * derives elapsed time from — never from a ticking counter.
 */
export interface ActiveSession {
  id: string;
  taskName: string;
  mode: FocusMode;
  /** Target duration in minutes (target mode only). */
  targetDuration?: number;
  status: ActiveSessionStatus;
  /** Epoch ms when the session started. */
  startedAt: number;
  /** Epoch ms when the session was last paused. */
  pausedAt: number | null;
  /** Accumulated paused time in ms (current pause excluded). */
  totalPausedDuration: number;
  /** Epoch ms when overtime began (only while in overtime). */
  overtimeSince: number | null;
  musicId?: string;
  backgroundId?: string;
  /** Custom body for the finish notification (target mode only). */
  completionMessage?: string;
  /** Pomodoro mode only: the full phase machine state. */
  pomodoro?: PomodoroState;
  createdAt: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  category: string;
  audioUrl: string;
  thumbnailUrl?: string;
  /** Duration in seconds. */
  duration?: number;
}

export interface Background {
  id: string;
  name: string;
  type: "image" | "video";
  assetUrl: string;
  thumbnailUrl?: string;
  /** Hint used to pick a procedural canvas/CSS fallback while placeholders are in place. */
  mood?: string;
}

/**
 * A curated atmosphere — music and background always travel as a pair.
 * Selecting an environment applies both its audio track and its background.
 */
export interface Environment {
  id: string;
  name: string;
  /** Short atmosphere description shown under the name (never a copy of it). */
  description: string;
  /** Music track id (matches a `MusicTrack`); undefined = quiet. */
  musicId?: string;
  /** Background id (matches a `Background`); undefined = default background. */
  backgroundId?: string;
  /** Grouping used to filter environments in the browse sheet. */
  category?: "quiet" | "study" | "nature" | "rain" | "lofi";
}

export interface AppSettings {
  defaultMode: FocusMode;
  defaultDuration: number;
  musicVolume: number;
  /** Sound played when a Target session reaches zero. */
  completionSoundId: string;
  lastEnvironmentId?: string;
  /** Remembered custom finish-notification message (empty = default body). */
  completionMessage?: string;
}

/** User's choices when launching a new focus session. */
export interface FocusConfig {
  taskName: string;
  mode: FocusMode;
  targetDuration?: number;
  completionMessage?: string;
  musicId?: string;
  backgroundId?: string;
  /** Pomodoro mode only: config snapshot for the new session. */
  pomodoro?: PomodoroConfig;
}

export const FOCUS_DURATION_PRESETS: readonly number[] = [25, 50, 90];
export const DEFAULT_TASK_NAME = "Focus Session";
/** Max length of the custom finish-notification message. */
export const MAX_COMPLETION_MESSAGE_LENGTH = 100;
