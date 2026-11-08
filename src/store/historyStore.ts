"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FocusSession } from "@/types/focus";

interface HistoryState {
  sessions: FocusSession[];
  hydrated: boolean;
  addSession: (session: FocusSession) => void;
  clearSessions: () => void;
}

/** Newest first. */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      hydrated: false,
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: "focus-history",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as HistoryState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
