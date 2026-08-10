"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ActiveSession, FocusConfig, FocusSession } from "@/types/focus";
import {
  completeSession,
  createSession,
  enterOvertime as engineEnterOvertime,
  pauseSession,
  resumeSession,
} from "@/lib/timer/timer";
import { useHistoryStore } from "./historyStore";

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
        set({ session: createSession(config, Date.now()), startedLocally: true });
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
        set({ session: engineEnterOvertime(session, Date.now()) });
      },

      complete: () => {
        const { session } = get();
        if (!session) return null;
        const record = completeSession(session, Date.now());
        useHistoryStore.getState().addSession(record);
        set({ session: null, startedLocally: false });
        return record;
      },

      discard: () => set({ session: null, startedLocally: false }),

      setEnvironment: ({ musicId, backgroundId }) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, musicId, backgroundId } });
      },
    }),
    {
      name: "focus-active-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
