/**
 * Appearance presets discovered from the official shadcn registry
 * (ui.shadcn.com/init, base "radix", style "radix-nova").
 *
 * Only identifiers live here. The actual token values live in
 * `src/app/globals.css` keyed by the matching `data-*` attribute, so a preset
 * has exactly one source of truth and previews reuse the real tokens.
 */

export const COLOR_MODES = ["dark", "light", "system"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const APPEARANCE_STYLES = [
  "nova",
  "vega",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
] as const;
export type AppearanceStyle = (typeof APPEARANCE_STYLES)[number];

export const BASE_COLORS = [
  "neutral",
  "stone",
  "zinc",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const;
export type BaseColor = (typeof BASE_COLORS)[number];

/**
 * Accent themes and chart palettes share the same official color names.
 * Base-name tones (stone, zinc, …) are not valid accents: the registry only
 * accepts them when they match the base color, so they are excluded here.
 */
export const PALETTE_COLORS = [
  "neutral",
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "teal",
  "violet",
  "yellow",
] as const;
export type ThemeColor = (typeof PALETTE_COLORS)[number];
export type ChartColor = (typeof PALETTE_COLORS)[number];

export interface AppearanceConfig {
  colorMode: ColorMode;
  style: AppearanceStyle;
  baseColor: BaseColor;
  /** Primary accent. Unrelated to the light/dark `colorMode`. */
  theme: ThemeColor;
  chartColor: ChartColor;
}

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  colorMode: "dark",
  style: "nova",
  baseColor: "stone",
  theme: "orange",
  chartColor: "orange",
};

export const STYLE_LABELS: Record<AppearanceStyle, string> = {
  nova: "Nova",
  vega: "Vega",
  maia: "Maia",
  lyra: "Lyra",
  mira: "Mira",
  luma: "Luma",
  sera: "Sera",
  rhea: "Rhea",
};

export const BASE_COLOR_LABELS: Record<BaseColor, string> = {
  neutral: "Neutral",
  stone: "Stone",
  zinc: "Zinc",
  mauve: "Mauve",
  olive: "Olive",
  mist: "Mist",
  taupe: "Taupe",
};

export const PALETTE_LABELS: Record<ThemeColor, string> = {
  neutral: "Default",
  amber: "Amber",
  blue: "Blue",
  cyan: "Cyan",
  emerald: "Emerald",
  fuchsia: "Fuchsia",
  green: "Green",
  indigo: "Indigo",
  lime: "Lime",
  orange: "Orange",
  pink: "Pink",
  purple: "Purple",
  red: "Red",
  rose: "Rose",
  sky: "Sky",
  teal: "Teal",
  violet: "Violet",
  yellow: "Yellow",
};

export function isColorMode(value: unknown): value is ColorMode {
  return COLOR_MODES.includes(value as ColorMode);
}

export function isAppearanceStyle(value: unknown): value is AppearanceStyle {
  return APPEARANCE_STYLES.includes(value as AppearanceStyle);
}

export function isBaseColor(value: unknown): value is BaseColor {
  return BASE_COLORS.includes(value as BaseColor);
}

export function isPaletteColor(value: unknown): value is ThemeColor {
  return PALETTE_COLORS.includes(value as ThemeColor);
}

/** Validates any persisted/unknown value, falling back to defaults per field. */
export function normalizeAppearance(value: unknown): AppearanceConfig {
  const raw = (value ?? {}) as Partial<Record<keyof AppearanceConfig, unknown>>;
  return {
    colorMode: isColorMode(raw.colorMode) ? raw.colorMode : DEFAULT_APPEARANCE.colorMode,
    style: isAppearanceStyle(raw.style) ? raw.style : DEFAULT_APPEARANCE.style,
    baseColor: isBaseColor(raw.baseColor) ? raw.baseColor : DEFAULT_APPEARANCE.baseColor,
    theme: isPaletteColor(raw.theme) ? raw.theme : DEFAULT_APPEARANCE.theme,
    chartColor: isPaletteColor(raw.chartColor) ? raw.chartColor : DEFAULT_APPEARANCE.chartColor,
  };
}
