import { DEFAULT_COMPLETION_SOUND_ID, getCompletionSound } from "@/data/sounds";
import { useSoundStore } from "@/store/soundStore";

const CHIME_VOLUME = 0.6;

/**
 * One shared element for every chime: browsers that gate playback on a user
 * gesture remember it per element, so the element primed on Start keeps
 * working when the session ends (which is not a gesture).
 */
let chime: HTMLAudioElement | null = null;

/** Last prime result, so the setup sheet can warn that sound is blocked. */
let soundBlocked = false;

/** Whether the last prime was refused by the browser. */
export function isCompletionSoundBlocked(): boolean {
  return soundBlocked;
}

function getChime(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  chime ??= new Audio();
  return chime;
}

function resolveUrl(soundId: string): string | undefined {
  const custom = useSoundStore
    .getState()
    .customSounds.find((sound) => sound.id === soundId);
  return custom?.dataUrl ?? getCompletionSound(soundId)?.url;
}

/** Plays a notification chime. Best-effort: a blocked autoplay is ignored. */
export function playCompletionSound(soundId = DEFAULT_COMPLETION_SOUND_ID): void {
  const url = resolveUrl(soundId);
  const el = getChime();
  if (!url || !el) return;
  el.src = url;
  el.volume = CHIME_VOLUME;
  void el.play().catch(() => {});
}

/**
 * Primes the shared chime from inside the Start focus click, so a browser that
 * only plays audio after a user gesture still plays it at the end of the
 * session. Returns true when the browser actually refused the playback
 * (autoplay policy, low-power mode); a missing file is not a refusal.
 * shortcut: primes one sound, later chimes swap the src on the same element.
 */
export async function unlockCompletionSound(
  soundId = DEFAULT_COMPLETION_SOUND_ID,
): Promise<boolean> {
  const url = resolveUrl(soundId);
  const el = getChime();
  if (!url || !el) return false;
  el.src = url;
  el.volume = 0;
  try {
    await el.play();
    el.pause();
    el.currentTime = 0;
    el.volume = CHIME_VOLUME;
    soundBlocked = false;
  } catch (error) {
    soundBlocked = (error as DOMException)?.name === "NotAllowedError";
  }
  return soundBlocked;
}
