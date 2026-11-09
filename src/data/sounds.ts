export interface CompletionSound {
  id: string;
  name: string;
  url: string;
}

/** End-of-session / phase notification sounds shipped in `public/sounds`. */
export const COMPLETION_SOUNDS: readonly CompletionSound[] = [
  { id: "bell", name: "Bell", url: "/sounds/bell.mp3" },
  { id: "cow-bell", name: "Cow bell", url: "/sounds/cow-bell.mp3" },
  { id: "school-bell", name: "School bell", url: "/sounds/school-bell.mp3" },
  { id: "alarm-clock-short", name: "Alarm", url: "/sounds/alarm-clock-short.mp3" },
  { id: "bedside-clock-alarm", name: "Bedside", url: "/sounds/bedside-clock-alarm.mp3" },
];

export interface CustomSound {
  /** `custom:<uuid>` — validated without needing the store. */
  id: string;
  name: string;
  dataUrl: string;
}

export const DEFAULT_COMPLETION_SOUND_ID = "bell";

export function isCompletionSoundId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    (id.startsWith("custom:") || COMPLETION_SOUNDS.some((sound) => sound.id === id))
  );
}

export function getCompletionSound(id?: string): CompletionSound | undefined {
  return COMPLETION_SOUNDS.find((sound) => sound.id === id);
}
