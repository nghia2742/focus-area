"use client";

import { useEffect } from "react";

/**
 * One global single-key shortcut. Ignores typing targets, modifier combos,
 * key repeats and any open dialog/sheet, so shortcuts never fight the UI.
 */
export function useHotkey(key: string, handler: () => void, enabled = true) {
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

      const overlayOpen = document.querySelector(
        '[data-slot="dialog-content"][data-state="open"], [data-slot="sheet-content"][data-state="open"]',
      );
      if (overlayOpen) return;

      // Stop the character from landing in the field that the shortcut focuses.
      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, enabled]);
}
