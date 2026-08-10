"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppSettings } from "@/types/focus";
import { DEFAULT_SETTINGS } from "@/lib/storage/localStorage";

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  update: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      hydrated: false,
      update: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: "focus-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
