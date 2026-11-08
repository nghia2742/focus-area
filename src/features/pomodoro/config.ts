import type { PomodoroConfig, PomodoroPhase } from "./types";

export const DEFAULTS: PomodoroConfig = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  roundsPerLongBreak: 4,
  totalRounds: 4,
  autoStartBreak: true,
  autoStartFocus: false,
};

export const LIMITS = {
  focusMin: { min: 1, max: 120 },
  shortBreakMin: { min: 1, max: 30 },
  longBreakMin: { min: 1, max: 60 },
  roundsPerLongBreak: { min: 2, max: 8 },
  totalRounds: { min: 1, max: 12 },
} as const;

export interface PomodoroPreset {
  id: string;
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

export const PRESETS: readonly PomodoroPreset[] = [
  { id: "25/5/15", focusMin: 25, shortBreakMin: 5, longBreakMin: 15 },
  { id: "50/10/30", focusMin: 50, shortBreakMin: 10, longBreakMin: 30 },
  { id: "90/15/30", focusMin: 90, shortBreakMin: 15, longBreakMin: 30 },
];

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

/** Clamps every field into its allowed range; missing fields fall back to defaults. */
export function clampConfig(input: Partial<PomodoroConfig> = {}): PomodoroConfig {
  return {
    focusMin: clampInt(input.focusMin, LIMITS.focusMin.min, LIMITS.focusMin.max, DEFAULTS.focusMin),
    shortBreakMin: clampInt(
      input.shortBreakMin,
      LIMITS.shortBreakMin.min,
      LIMITS.shortBreakMin.max,
      DEFAULTS.shortBreakMin,
    ),
    longBreakMin: clampInt(
      input.longBreakMin,
      LIMITS.longBreakMin.min,
      LIMITS.longBreakMin.max,
      DEFAULTS.longBreakMin,
    ),
    roundsPerLongBreak: clampInt(
      input.roundsPerLongBreak,
      LIMITS.roundsPerLongBreak.min,
      LIMITS.roundsPerLongBreak.max,
      DEFAULTS.roundsPerLongBreak,
    ),
    totalRounds: clampInt(
      input.totalRounds,
      LIMITS.totalRounds.min,
      LIMITS.totalRounds.max,
      DEFAULTS.totalRounds,
    ),
    autoStartBreak: input.autoStartBreak ?? DEFAULTS.autoStartBreak,
    autoStartFocus: input.autoStartFocus ?? DEFAULTS.autoStartFocus,
  };
}
