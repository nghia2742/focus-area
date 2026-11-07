"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Single Zen Mode toggle pinned to the right edge, vertically centered. Sits
 * on the room artwork, so it uses the fixed artwork tokens instead of the
 * theme palette. History and Settings live in the navbar.
 */
export function FocusRail() {
  const zenMode = useSettingsStore((s) => s.zenMode);
  const setZenMode = useSettingsStore((s) => s.setZenMode);

  return (
    <div className="fixed top-1/2 right-3 z-40 -translate-y-1/2 sm:right-6">
      <div className="artwork-surface flex flex-col items-center p-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="lg"
              pressed={zenMode}
              onPressedChange={setZenMode}
              aria-label={zenMode ? "Turn Zen Mode off" : "Turn Zen Mode on"}
              className="size-11 rounded-full text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {zenMode ? <EyeOffIcon /> : <EyeIcon />}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="left">Zen Mode</TooltipContent>
        </Tooltip>
      </div>
      <span className="sr-only" aria-live="polite">
        {zenMode ? "Zen Mode is on — interface faded" : ""}
      </span>
    </div>
  );
}
