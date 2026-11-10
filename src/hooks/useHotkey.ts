"use client";

import { useEffect } from "react";

interface HotkeyOptions {
  enabled?: boolean;
  /**
   * Keep the shortcut alive while a dialog or sheet is open. Only for the
   * global chrome shortcuts (Settings / History / Zen) — anything that opens
   * another overlay stays blocked so it can never stack on the open one.
   */
  allowInOverlay?: boolean;
}

/**
 * One global single-key shortcut. Ignores typing targets, modifier combos, key
 * repeats and — unless `allowInOverlay` — any open dialog/sheet, so shortcuts
 * never fight the UI.
 */
export function useHotkey(
  key: string,
  handler: () => void,
  { enabled = true, allowInOverlay = false }: HotkeyOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() !== key) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (!allowInOverlay && isOverlayOpen()) return;

      // Stop the character from landing in the field that the shortcut focuses.
      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, enabled, allowInOverlay]);
}

/** True while a dialog or the bottom sheet is mounted open. */
function isOverlayOpen(): boolean {
  return (
    document.querySelector(
      '[data-slot="dialog-content"][data-state="open"], [data-slot="sheet-content"][data-state="open"]',
    ) !== null
  );
}
