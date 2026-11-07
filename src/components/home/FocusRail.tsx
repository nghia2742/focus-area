"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Disc3Icon,
  EyeIcon,
  EyeOffIcon,
  MountainIcon,
  MusicIcon,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

/**
 * Vertical glass rail pinned to the right edge, vertically centered. Order
 * (top → bottom): Zen Mode · Backgrounds · Sounds. Always visible — during
 * the setup chrome and while a session runs. History and Settings live in the
 * navbar, not here.
 */
export function FocusRail() {
  return (
    <div className="fixed top-1/2 right-6 z-40 flex -translate-y-1/2 flex-col items-center gap-4">
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
  "flex size-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[12px] outline-none transition-[background-color,border-color,color,transform] duration-200 hover:border-white/20 hover:bg-white/12 hover:text-white active:scale-95 focus-visible:ring-3 focus-visible:ring-white/30";

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
      onClick={() => console.log("Backgrounds — coming soon")}
      aria-label="Backgrounds"
      title="Backgrounds"
      className={railButton}
    >
      <MountainIcon className="size-5" />
    </button>
  );
}

/**
 * Sounds — two visual states only (no real audio yet): a still note when
 * idle, a slowly rotating disc when "playing". Clicking toggles the demo
 * state. The rotation is disabled under prefers-reduced-motion.
 */
function SoundsButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const rotating = isPlaying && !reduceMotion;

  return (
    <button
      type="button"
      onClick={() => setIsPlaying((v) => !v)}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Pause music" : "Play music"}
      title={isPlaying ? "Playing — tap to pause" : "Music off — tap to play"}
      className={railButton}
    >
      <motion.div
        className="flex size-5 items-center justify-center"
        animate={rotating ? { rotate: 360 } : { rotate: 0 }}
        transition={
          rotating
            ? { repeat: Infinity, duration: 8, ease: "linear" }
            : { duration: 0 }
        }
      >
        {isPlaying ? <Disc3Icon className="size-5" /> : <MusicIcon className="size-5" />}
      </motion.div>
    </button>
  );
}
