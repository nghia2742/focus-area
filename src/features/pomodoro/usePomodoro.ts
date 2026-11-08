"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusStore } from "@/store/focusStore";
import { useNow } from "@/hooks/useNow";
import { notifyPomodoroPhase } from "@/lib/notifications";
import { formatTimer } from "@/lib/timer/format";
import { PHASE_LABELS } from "./config";
import * as machine from "./machine";
import type { PomodoroState } from "./types";

const DEFAULT_TITLE = "Focus — one thing, right now";

/** Drives the live Pomodoro session: ticks, transitions, persistence, title, notifications. */
export function usePomodoro() {
  const session = useFocusStore((s) => s.session);
  const setPomodoro = useFocusStore((s) => s.setPomodoro);
  const now = useNow(250);
  const [tick, setTick] = useState(0);

  const state = session?.pomodoro ?? null;
  const restoredFor = useRef<string | null>(null);
  const handled = useRef<PomodoroState | null>(null);

  /* A hidden tab gets its interval throttled — check the clock the moment it returns. */
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) setTick((value) => value + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (!session || !state) return;
    const current = Math.max(now, Date.now());

    if (restoredFor.current !== session.id) {
      restoredFor.current = session.id;
      // Finish at most one phase that ended while away, then wait for the user.
      if (state.status === "running" && state.endsAt != null && current >= state.endsAt) {
        setPomodoro(machine.restore(state, current));
        return;
      }
    }

    if (state.status !== "running" || state.endsAt == null) return;
    if (current < state.endsAt) return;
    if (handled.current === state) return;
    handled.current = state;

    // Transition at the scheduled boundary so throttled ticks don't shift the cycle.
    const next = machine.complete(state, state.endsAt);
    setPomodoro(next);
    notifyPomodoroPhase(next);
  }, [session, state, now, tick, setPomodoro]);

  const remainingMs = state
    ? state.status === "running" && state.endsAt != null
      ? Math.max(0, state.endsAt - now)
      : state.remainingMs
    : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    document.title = state ? titleFor(state, remainingSec) : DEFAULT_TITLE;
  }, [state, remainingSec]);

  useEffect(() => () => {
    document.title = DEFAULT_TITLE;
  }, []);

  const start = () => {
    if (!state) return;
    setPomodoro(machine.start(state.config, state.task, Date.now()));
  };

  const pause = () => {
    if (!state) return;
    setPomodoro(machine.pause(state, Date.now()));
  };

  const resume = () => {
    if (!state) return;
    setPomodoro(machine.resume(state, Date.now()));
  };

  const skip = () => {
    if (!state) return;
    const next = machine.skip(state, Date.now());
    setPomodoro(next);
    notifyPomodoroPhase(next);
  };

  const startNext = () => {
    if (!state) return;
    setPomodoro(machine.startNext(state, Date.now()));
  };

  const end = () => {
    if (!state) return;
    setPomodoro(machine.end(state, Date.now()));
  };

  const progress = state
    ? Math.min(1, Math.max(0, 1 - remainingMs / machine.phaseMs(state.phase, state.config)))
    : 0;

  return { state, remainingMs, progress, start, pause, resume, skip, startNext, end };
}

function titleFor(state: PomodoroState, remainingSec: number): string {
  const label = PHASE_LABELS[state.phase];
  if (state.status === "done") return "Complete";
  if (state.status === "awaiting") return `Ready · ${label}`;

  const time = formatTimer(remainingSec);
  const suffix =
    state.phase === "focus" ? `${label} ${state.round}/${state.config.totalRounds}` : label;
  return state.status === "paused" ? `⏸ ${time} · ${suffix}` : `${time} · ${suffix}`;
}
