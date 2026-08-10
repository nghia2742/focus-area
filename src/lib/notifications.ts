"use client";

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

/** Fires a browser notification when a target session reaches zero. */
export function notifyTargetReached(minutes: number): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    new Notification("Focus complete", {
      body: `You've reached your ${minutes}-minute focus target.`,
      tag: "focus-target-reached",
    });
  } catch {
    // Notifications are best-effort; never interrupt the session.
  }
}
