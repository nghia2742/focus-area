"use client";

import {
  EyeIcon,
  EyeOffIcon,
  MountainIcon,
  MusicIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Vertical glass rail pinned to the right edge, vertically centered. Order
 * (top → bottom): Zen Mode · Backgrounds · Sounds. Always visible — during
 * the setup chrome and while a session runs. History and Settings live in the
 * navbar, not here.
 */
export function FocusRail() {
  return (
    <div className="fixed top-1/2 right-3 z-40 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-6 sm:gap-4">
      <ZenButton />
      <BackgroundsButton />
      <SoundsButton />

      {useSettingsStore((s) => s.zenMode) && (
        <span className="sr-only">Zen Mode is on — interface faded</span>
      )}
    </div>
  );
}

/** Glassmorphism pill shared by the rail buttons (48×48). */
const railButton =
  "flex size-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[12px] outline-none transition-[background-color,border-color,color,transform,opacity] duration-200 hover:border-white/20 hover:bg-white/12 hover:text-white active:scale-95 focus-visible:ring-3 focus-visible:ring-white/30 sm:size-12";

const railButtonDisabled =
  "cursor-not-allowed opacity-45 hover:border-white/12 hover:bg-white/8 hover:text-white/85 active:scale-100";

function ZenButton() {
  const zenMode = useSettingsStore((s) => s.zenMode);
  const setZenMode = useSettingsStore((s) => s.setZenMode);

  return (
    <button
      type="button"
      onClick={() => setZenMode(!zenMode)}
      aria-pressed={zenMode}
      aria-label={zenMode ? "Turn Zen Mode off" : "Turn Zen Mode on"}
      title={zenMode ? "Zen Mode on" : "Zen Mode off"}
      className={railButton}
    >
      {zenMode ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
    </button>
  );
}

/** Placeholder — backgrounds panel comes in a later phase. */
function BackgroundsButton() {
  return (
    <button
      type="button"
      disabled
      aria-label="Backgrounds (coming soon)"
      title="Backgrounds (coming soon)"
      className={cn(railButton, railButtonDisabled)}
    >
      <MountainIcon className="size-5" />
    </button>
  );
}

/** Placeholder — real session audio controls are not exposed here yet. */
function SoundsButton() {
  return (
    <button
      type="button"
      disabled
      aria-label="Sounds (coming soon)"
      title="Sounds (coming soon)"
      className={cn(railButton, railButtonDisabled)}
    >
      <MusicIcon className="size-5" />
    </button>
  );
}
