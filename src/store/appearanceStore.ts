"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_APPEARANCE,
  isAppearanceStyle,
  isBaseColor,
  isPaletteColor,
  type AppearanceStyle,
  type BaseColor,
  type ChartColor,
  type ThemeColor,
} from "@/lib/appearance/presets";
import { APPEARANCE_STORAGE_KEY } from "@/lib/appearance/prehydrate";

interface AppearanceState {
  style: AppearanceStyle;
  baseColor: BaseColor;
  theme: ThemeColor;
  chartColor: ChartColor;
  hydrated: boolean;
  setStyle: (style: AppearanceStyle) => void;
  setBaseColor: (baseColor: BaseColor) => void;
  setTheme: (theme: ThemeColor) => void;
  setChartColor: (chartColor: ChartColor) => void;
  resetAppearance: () => void;
}

const DEFAULTS = {
  style: DEFAULT_APPEARANCE.style,
  baseColor: DEFAULT_APPEARANCE.baseColor,
  theme: DEFAULT_APPEARANCE.theme,
  chartColor: DEFAULT_APPEARANCE.chartColor,
};

/**
 * Appearance lives in its own store so timer/sound preferences reset
 * independently. Color mode is owned by next-themes (`.dark` class) and is
 * composed with this config in `AppearanceProvider`.
 */
export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,
      setStyle: (style) => set({ style }),
      setBaseColor: (baseColor) => set({ baseColor }),
      setTheme: (theme) => set({ theme }),
      setChartColor: (chartColor) => set({ chartColor }),
      resetAppearance: () => set(DEFAULTS),
    }),
    {
      name: APPEARANCE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        style: state.style,
        baseColor: state.baseColor,
        theme: state.theme,
        chartColor: state.chartColor,
      }),
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as Partial<Record<keyof typeof DEFAULTS, unknown>>;
        return {
          ...current,
          style: isAppearanceStyle(raw.style) ? raw.style : current.style,
          baseColor: isBaseColor(raw.baseColor) ? raw.baseColor : current.baseColor,
          theme: isPaletteColor(raw.theme) ? raw.theme : current.theme,
          chartColor: isPaletteColor(raw.chartColor) ? raw.chartColor : current.chartColor,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
