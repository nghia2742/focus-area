import { DEFAULT_APPEARANCE } from "./presets";

export const APPEARANCE_STORAGE_KEY = "focus-appearance";

/**
 * Runs before the first paint (rendered as a blocking script at the top of
 * `<body>`). It mirrors the persisted appearance onto the root data attributes
 * so tokens are correct on the very first frame.
 *
 * Defaults are interpolated from `DEFAULT_APPEARANCE` — never typed twice.
 */
export const appearanceScript = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  APPEARANCE_STORAGE_KEY,
)});var state=raw&&JSON.parse(raw).state||{};var root=document.documentElement;root.dataset.style=state.style||${JSON.stringify(
  DEFAULT_APPEARANCE.style,
)};root.dataset.baseColor=state.baseColor||${JSON.stringify(
  DEFAULT_APPEARANCE.baseColor,
)};root.dataset.themeColor=state.theme||${JSON.stringify(
  DEFAULT_APPEARANCE.theme,
)};root.dataset.chartColor=state.chartColor||${JSON.stringify(
  DEFAULT_APPEARANCE.chartColor,
)};}catch(e){}})();`;
