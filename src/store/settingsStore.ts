"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppSettings } from "@/types/focus";
import { DEFAULT_SETTINGS } from "@/lib/storage/localStorage";

interface SettingsState {
  settings: AppSettings;
  /** Zen Mode: fades the app chrome to 0.25 opacity. Ephemeral, not persisted. */
  zenMode: boolean;
  hydrated: boolean;
  update: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  setZenMode: (zenMode: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      zenMode: false,
      hydrated: false,
      update: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      setZenMode: (zenMode) => set({ zenMode }),
    }),
    {
      name: "focus-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => {
        const saved = (persisted as { settings?: Partial<AppSettings> } | undefined)
          ?.settings;
        return { ...current, settings: { ...DEFAULT_SETTINGS, ...saved } };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
