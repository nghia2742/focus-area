"use client";

import { useState } from "react";

/**
 * A reference "now" captured once at mount. Used by read-only pages (history)
 * so day/time grouping is stable during render without calling impure
 * functions (Date.now) directly in the render body.
 */
export function useReferenceNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}
