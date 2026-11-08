import { test } from "node:test";
import assert from "node:assert/strict";
import { clampConfig } from "./config.ts";
import {
  complete,
  end,
  pause,
  restore,
  resume,
  skip,
  start,
  startNext,
} from "./machine.ts";
import type { PomodoroConfig, PomodoroState } from "./types.ts";

const MIN = 60_000;

function config(overrides: Partial<PomodoroConfig> = {}): PomodoroConfig {
  return clampConfig({ ...overrides });
}

function sequence(s: PomodoroState, steps: number): string[] {
  const out: string[] = [s.phase];
  for (let i = 0; i < steps && s.status !== "done"; i++) {
    if (s.status === "awaiting") s = startNext(s, 0);
    s = complete(s, s.endsAt!);
    out.push(s.status === "done" ? "done" : s.phase);
  }
  return out;
}

test("4 rounds never schedule a long break", () => {
  const c = config({ totalRounds: 4, roundsPerLongBreak: 4 });
  const s = start(c, "Task", 0);
  assert.deepEqual(sequence(s, 10), [
    "focus",
    "shortBreak",
    "focus",
    "shortBreak",
    "focus",
    "shortBreak",
    "focus",
    "done",
  ]);
});

test("8 rounds schedule a long break after round 4 and end after round 8", () => {
  const c = config({ totalRounds: 8, roundsPerLongBreak: 4 });
  const seq = sequence(start(c, "Task", 0), 20);
  assert.equal(seq[7], "longBreak");
  assert.equal(seq.at(-1), "done");
});

test("a single round ends without a break", () => {
  const c = config({ totalRounds: 1 });
  const s = start(c, "Task", 0);
  const done = complete(s, s.endsAt!);
  assert.equal(done.status, "done");
  assert.equal(done.phase, "focus");
});

test("pause keeps the remaining time and resume rebuilds endsAt", () => {
  const s = start(config({ focusMin: 25 }), "Task", 0);
  const paused = pause(s, 10 * MIN);
  assert.equal(paused.status, "paused");
  assert.equal(paused.remainingMs, 15 * MIN);

  const resumed = resume(paused, 20 * MIN);
  assert.equal(resumed.status, "running");
  assert.equal(resumed.endsAt, 35 * MIN);
});

test("skipping focus credits elapsed time but not the round", () => {
  const s = start(config({ focusMin: 25 }), "Task", 0);
  const skipped = skip(s, 10 * MIN);
  assert.equal(skipped.focusMsDone, 10 * MIN);
  assert.equal(skipped.roundsCompleted, 0);
  assert.equal(skipped.phase, "shortBreak");
});

test("completing focus credits the full phase and the round", () => {
  const s = start(config({ focusMin: 25 }), "Task", 0);
  const next = complete(s, s.endsAt!);
  assert.equal(next.focusMsDone, 25 * MIN);
  assert.equal(next.roundsCompleted, 1);
});

test("breaks never add focus time", () => {
  let s = complete(start(config({ focusMin: 25 }), "Task", 0), 25 * MIN);
  assert.equal(s.phase, "shortBreak");
  const before = s.focusMsDone;
  s = complete(s, s.endsAt!);
  assert.equal(s.focusMsDone, before);
});

test("auto-start follows the destination phase", () => {
  const noBreak = config({ autoStartBreak: false, autoStartFocus: true });
  let s = complete(start(noBreak, "Task", 0), 25 * MIN);
  assert.equal(s.status, "awaiting");

  s = startNext(s, 30 * MIN);
  assert.equal(s.status, "running");

  const focusAgain = complete(s, s.endsAt!);
  assert.equal(focusAgain.status, "running");
  assert.equal(focusAgain.phase, "focus");
});

test("restore finishes one elapsed phase and waits", () => {
  const c = config({ autoStartBreak: true });
  const s = start(c, "Task", 0);
  const restored = restore(s, 2 * 60 * MIN);
  assert.equal(restored.status, "awaiting");
  assert.equal(restored.phase, "shortBreak");
  assert.equal(restored.endsAt, null);
  assert.equal(restored.focusMsDone, 25 * MIN);
  assert.equal(restored.roundsCompleted, 1);
});

test("restore of the final round ends the session", () => {
  const s = start(config({ totalRounds: 1 }), "Task", 0);
  const restored = restore(s, 60 * MIN);
  assert.equal(restored.status, "done");
});

test("ending during a break adds no focus time", () => {
  const s = complete(start(config({ focusMin: 25 }), "Task", 0), 25 * MIN);
  const before = s.focusMsDone;
  const ended = end(s, s.endsAt! - MIN);
  assert.equal(ended.status, "done");
  assert.equal(ended.focusMsDone, before);
});

test("config clamps out-of-range values", () => {
  const c = clampConfig({ focusMin: 0, totalRounds: 20 });
  assert.equal(c.focusMin, 1);
  assert.equal(clampConfig({ focusMin: 500 }).focusMin, 120);
  assert.equal(c.totalRounds, 12);
});
