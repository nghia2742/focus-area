"use client";

import type { PomodoroState } from "@/features/pomodoro/types";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function requestNotificationPermission(): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission === "default") {
    // Best-effort; must be called within a user gesture to be meaningful.
    void Notification.requestPermission();
  }
}

/** The finish-notification body: the custom message, or the default sentence. */
function completionBody(minutes: number, message?: string): string {
  return message?.trim() || `You've reached your ${minutes}-minute focus target.`;
}

function show(title: string, body: string, tag: string): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag });
  } catch {
    // Notifications are best-effort; never interrupt the session.
  }
}

/** Fires a browser notification when a target session reaches zero. */
export function notifyTargetReached(minutes: number, message?: string): void {
  show("Focus complete", completionBody(minutes, message), "focus-target-reached");
}

/** Notifies when a Pomodoro phase changes (never used while restoring). */
export function notifyPomodoroPhase(state: PomodoroState): void {
  const { phase, round, config, startedAt } = state;
  const tag = `pomodoro-${phase}-${round}-${startedAt}`;

  if (state.status === "done") {
    notifyTargetReached(config.focusMin);
    return;
  }
  if (phase === "focus") {
    show("Back to focus", `Round ${round}/${config.totalRounds} starting.`, tag);
    return;
  }
  const minutes = phase === "shortBreak" ? config.shortBreakMin : config.longBreakMin;
  show(
    phase === "shortBreak" ? "Short break" : "Long break",
    `You finished round ${round}/${config.totalRounds}. Take a ${minutes}-minute break.`,
    tag,
  );
}

export type NotificationPreviewResult = NotificationPermission | "unsupported";

/**
 * Asks for permission when needed, then shows the finish notification so the
 * user can see their message. Must be called from a user gesture (a click).
 */
export async function previewCompletionNotification(
  minutes: number,
  message?: string,
): Promise<NotificationPreviewResult> {
  if (!isNotificationSupported()) return "unsupported";
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission === "granted") {
    show("Focus complete", completionBody(minutes, message), "focus-target-reached-preview");
  }
  return permission;
}
