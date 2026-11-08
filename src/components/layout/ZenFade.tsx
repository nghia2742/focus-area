"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSettingsStore } from "@/store/settingsStore";

interface ZenFadeProps {
  children: React.ReactNode;
  /** Resting opacity when Zen Mode is off. Elements with a low base keep it. */
  baseOpacity?: number;
}

/**
 * App-level Zen Mode fade. Wraps chrome (navbar, rail, CTA) and fades it to
 * 0.25 together over 400ms easeInOut. Elements stay interactive while faded
 * so Zen Mode can be toggled back off. Not persisted — always off on load.
 */
export function ZenFade({ children, baseOpacity = 1 }: ZenFadeProps) {
  const zenMode = useSettingsStore((s) => s.zenMode);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: zenMode ? 0.25 : baseOpacity }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
