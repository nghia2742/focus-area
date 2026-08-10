"use client";

import { useFocusStore } from "@/store/focusStore";
import { useNow } from "./useNow";
import {
  getActualDurationSec,
  getDerivedStatus,
  getElapsedMs,
  getOvertimeSec,
  getRemainingSec,
} from "@/lib/timer/timer";

/**
 * Subscribes to the active session and derives all timer values from
 * timestamps. Consumers re-render on every tick — keep this component
 * lightweight and isolated.
 */
export function useFocusTimer() {
  const session = useFocusStore((s) => s.session);
  const now = useNow(500);

  if (!session) {
    return {
      session: null as never,
      status: "idle" as const,
      elapsedSec: 0,
      remainingSec: 0,
      overtimeSec: 0,
      elapsedMs: 0,
    };
  }

  const status = getDerivedStatus(session, now);

  return {
    session,
    status,
    elapsedSec: getActualDurationSec(session, now),
    remainingSec: getRemainingSec(session, now),
    overtimeSec: getOvertimeSec(session, now),
    elapsedMs: getElapsedMs(session, now),
  };
}
