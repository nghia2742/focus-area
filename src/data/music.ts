import type { MusicTrack } from "@/types/focus";

/**
 * The focus soundtrack. Each track is paired with a background via an
 * environment in `src/data/environments.ts` — music and background always
 * come as a pair.
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "late-night-study", name: "Late Night Study", category: "Ambient", audioUrl: "/music/late-night-study.mp3" },
  { id: "violin-velvet-study-room", name: "Violin Velvet Study", category: "Ambient", audioUrl: "/music/violin-velvet-study-room.mp3" },
];

export function getMusicTrack(id?: string): MusicTrack | undefined {
  if (!id) return undefined;
  return MUSIC_TRACKS.find((t) => t.id === id);
}
