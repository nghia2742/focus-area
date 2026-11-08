"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULTS, clampConfig } from "./config";
import type { PomodoroConfig } from "./types";

interface PomodoroConfigState {
  config: PomodoroConfig;
  hydrated: boolean;
  update: (partial: Partial<PomodoroConfig>) => void;
  reset: () => void;
}

/** Default Pomodoro settings chosen in Settings (persisted separately from a session). */
export const usePomodoroConfigStore = create<PomodoroConfigState>()(
  persist(
    (set) => ({
      config: DEFAULTS,
      hydrated: false,
      update: (partial) =>
        set((state) => ({ config: clampConfig({ ...state.config, ...partial }) })),
      reset: () => set({ config: DEFAULTS }),
    }),
    {
      name: "focus:pomodoro:config",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ config: state.config }),
      migrate: (persisted) => persisted as PomodoroConfigState,
      merge: (persisted, current) => {
        const raw = (persisted as { config?: Partial<PomodoroConfig> } | undefined)?.config;
        return { ...current, config: clampConfig(raw) };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
