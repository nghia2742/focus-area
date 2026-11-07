"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import { useAppearanceStore } from "@/store/appearanceStore";
import {
  DEFAULT_APPEARANCE,
  type AppearanceConfig,
  type AppearanceStyle,
  type BaseColor,
  type ChartColor,
  type ColorMode,
  type ThemeColor,
} from "@/lib/appearance/presets";

interface AppearanceContextValue {
  appearance: AppearanceConfig;
  setColorMode: (mode: ColorMode) => void;
  setStyle: (style: AppearanceStyle) => void;
  setBaseColor: (color: BaseColor) => void;
  setTheme: (color: ThemeColor) => void;
  setChartColor: (color: ChartColor) => void;
  resetAppearance: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function isColorMode(value: string | undefined): value is ColorMode {
  return value === "dark" || value === "light" || value === "system";
}

/**
 * Applies the accent/base/chart/style dimensions as data attributes on <html>.
 * CSS owns the token values (see `globals.css`), so switching a preset is a
 * single attribute write — no re-render of the tree and no page reload.
 */
function applyAppearance(config: Omit<AppearanceConfig, "colorMode">) {
  const root = document.documentElement;
  root.dataset.style = config.style;
  root.dataset.baseColor = config.baseColor;
  root.dataset.themeColor = config.theme;
  root.dataset.chartColor = config.chartColor;
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const style = useAppearanceStore((s) => s.style);
  const baseColor = useAppearanceStore((s) => s.baseColor);
  const theme = useAppearanceStore((s) => s.theme);
  const chartColor = useAppearanceStore((s) => s.chartColor);
  const setStyle = useAppearanceStore((s) => s.setStyle);
  const setBaseColor = useAppearanceStore((s) => s.setBaseColor);
  const setTheme = useAppearanceStore((s) => s.setTheme);
  const setChartColor = useAppearanceStore((s) => s.setChartColor);
  const resetStore = useAppearanceStore((s) => s.resetAppearance);

  const { theme: themeMode, setTheme: setThemeMode } = useTheme();
  const colorMode: ColorMode = isColorMode(themeMode)
    ? themeMode
    : DEFAULT_APPEARANCE.colorMode;

  useEffect(() => {
    applyAppearance({ style, baseColor, theme, chartColor });
  }, [style, baseColor, theme, chartColor]);

  const setColorMode = useCallback(
    (mode: ColorMode) => setThemeMode(mode),
    [setThemeMode],
  );

  const resetAppearance = useCallback(() => {
    resetStore();
    setThemeMode(DEFAULT_APPEARANCE.colorMode);
  }, [resetStore, setThemeMode]);

  const appearance = useMemo<AppearanceConfig>(
    () => ({ colorMode, style, baseColor, theme, chartColor }),
    [colorMode, style, baseColor, theme, chartColor],
  );

  const value = useMemo<AppearanceContextValue>(
    () => ({
      appearance,
      setColorMode,
      setStyle,
      setBaseColor,
      setTheme,
      setChartColor,
      resetAppearance,
    }),
    [appearance, setColorMode, setStyle, setBaseColor, setTheme, setChartColor, resetAppearance],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
