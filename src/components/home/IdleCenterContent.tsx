"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSettingsStore } from "@/store/settingsStore";
import { ZenFade } from "@/components/home/ZenFade";

/**
 * Time-of-day greeting shown on the idle screen above the Focus CTA. If a
 * task was saved from Focus Setup, that task name is shown instead. Renders
 * with a 0.55 base opacity and fades with Zen Mode to the shared 0.25.
 */
export function IdleCenterContent() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const lastTaskName = useSettingsStore((s) => s.settings.lastTaskName);
  const reduceMotion = useReducedMotion();

  if (!hydrated) return null;

  const text = lastTaskName?.trim() || greetingForHour(new Date().getHours());

  return (
    <ZenFade baseOpacity={0.55}>
      <motion.p
        className="pointer-events-none fixed bottom-[clamp(7.5rem,28vh,13.5rem)] left-1/2 z-30 -translate-x-1/2 max-w-[min(80vw,28rem)] truncate px-4 font-heading text-base font-medium tracking-tight text-white sm:text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
      >
        {text}
      </motion.p>
    </ZenFade>
  );
}

/** 05:00–11:59 morning · 12:00–17:59 afternoon · 18:00–04:59 evening. */
function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}
