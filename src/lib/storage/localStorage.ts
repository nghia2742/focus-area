import type { ActiveSession, AppSettings, FocusSession } from "@/types/focus";

export const STORAGE_KEYS = {
  settings: "focus:settings",
  sessions: "focus:sessions",
  activeSession: "focus:active-session",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  defaultMode: "target",
  defaultDuration: 50,
  musicVolume: 0.6,
  completionSoundId: "bell",
  completionMessage: "",
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

function readRaw<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / unavailable — the session should never crash over this.
  }
}

export function getSettings(): AppSettings {
  return read<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  write(STORAGE_KEYS.settings, settings);
}

export function getSessions(): FocusSession[] {
  return readRaw<FocusSession[]>(STORAGE_KEYS.sessions, []);
}

export function saveSessions(sessions: FocusSession[]): void {
  write(STORAGE_KEYS.sessions, sessions);
}

export function getActiveSession(): ActiveSession | null {
  return readRaw<ActiveSession | null>(STORAGE_KEYS.activeSession, null);
}

export function saveActiveSession(session: ActiveSession | null): void {
  if (session == null) {
    if (isBrowser()) window.localStorage.removeItem(STORAGE_KEYS.activeSession);
    return;
  }
  write(STORAGE_KEYS.activeSession, session);
}
