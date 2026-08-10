"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current epoch time and re-renders on a fixed interval.
 * Used only by isolated components (the timer display) so the rest of the
 * app never re-renders every tick.
 */
export function useNow(intervalMs = 500): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
