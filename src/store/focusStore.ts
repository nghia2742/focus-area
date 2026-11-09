"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ActiveSession, FocusConfig, FocusSession } from "@/types/focus";
import type { PomodoroState } from "@/features/pomodoro/types";
import { start as startPomodoro } from "@/features/pomodoro/machine";
import {
  completeSession,
  createSession,
  enterOvertime as engineEnterOvertime,
  pauseSession,
  resumeSession,
} from "@/lib/timer/timer";
import { useHistoryStore } from "./historyStore";
import { useSettingsStore } from "./settingsStore";

interface FocusState {
  session: ActiveSession | null;
  /** True when the session was started in this page view (vs restored). */
  startedLocally: boolean;
  hydrated: boolean;
  start: (config: FocusConfig) => void;
  pause: () => void;
  resume: () => void;
  enterOvertime: () => void;
  /** Completes the session, persists it to history and clears the active one. */
  complete: () => FocusSession | null;
  /** Replaces the Pomodoro phase state on the active session. */
  setPomodoro: (pomodoro: PomodoroState) => void;
  /** Saves the finished Pomodoro (focus time only) and clears the active session. */
  finishPomodoro: () => FocusSession | null;
  /** Discards the active session without saving. */
  discard: () => void;
  /** Swaps the music/background pair on the active session. */
  setEnvironment: (environment: { musicId?: string; backgroundId?: string }) => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      session: null,
      startedLocally: false,
      hydrated: false,

      start: (config) => {
        if (get().session) return; // double-start guard
        const now = Date.now();
        const session = createSession(config, now);
        set({
          session:
            config.mode === "pomodoro" && config.pomodoro
              ? {
                  ...session,
                  pomodoro: startPomodoro(config.pomodoro, session.taskName, now),
                }
              : session,
          startedLocally: true,
        });
        useSettingsStore.getState().setZenMode(true);
      },

      pause: () => {
        const { session } = get();
        if (!session) return;
        set({ session: pauseSession(session, Date.now()) });
      },

      resume: () => {
        const { session } = get();
        if (!session) return;
        set({ session: resumeSession(session, Date.now()) });
      },

      enterOvertime: () => {
        const { session } = get();
        if (!session) return;
        set({ session: engineEnterOvertime(session) });
      },

      complete: () => {
        const { session } = get();
        if (!session) return null;
        const record = completeSession(session, Date.now());
        useHistoryStore.getState().addSession(record);
        set({ session: null, startedLocally: false });
        useSettingsStore.getState().setZenMode(false);
        return record;
      },

      setPomodoro: (pomodoro) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, pomodoro } });
      },

      finishPomodoro: () => {
        const { session } = get();
        if (!session?.pomodoro) return null;
        const { pomodoro } = session;
        const record: FocusSession = {
          id: session.id,
          taskName: session.taskName,
          mode: "pomodoro",
          actualDuration: Math.round(pomodoro.focusMsDone / 1000),
          startedAt: pomodoro.startedAt,
          endedAt: Date.now(),
          status: "completed",
          musicId: session.musicId,
          backgroundId: session.backgroundId,
          roundsCompleted: pomodoro.roundsCompleted,
          roundsPlanned: pomodoro.config.totalRounds,
          createdAt: session.createdAt,
        };
        if (record.actualDuration >= 60) {
          useHistoryStore.getState().addSession(record);
        }
        set({ session: null, startedLocally: false });
        useSettingsStore.getState().setZenMode(false);
        return record;
      },

      discard: () => {
        set({ session: null, startedLocally: false });
        useSettingsStore.getState().setZenMode(false);
      },

      setEnvironment: ({ musicId, backgroundId }) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, musicId, backgroundId } });
      },
    }),
    {
      name: "focus-active-session",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
      migrate: (persisted) => persisted as FocusState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
