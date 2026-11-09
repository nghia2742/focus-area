import { DEFAULT_COMPLETION_SOUND_ID, getCompletionSound } from "@/data/sounds";
import { useSoundStore } from "@/store/soundStore";

/** Plays a notification chime. Best-effort: a blocked autoplay is ignored. */
export function playCompletionSound(soundId = DEFAULT_COMPLETION_SOUND_ID): void {
  const custom = useSoundStore
    .getState()
    .customSounds.find((sound) => sound.id === soundId);
  const url = custom?.dataUrl ?? getCompletionSound(soundId)?.url;
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = 0.6;
  void audio.play().catch(() => {});
}
