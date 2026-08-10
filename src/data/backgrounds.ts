import type { Background } from "@/types/focus";

/**
 * The available backgrounds. Each is paired with a music track via an
 * environment in `src/data/environments.ts` — music and background always
 * come as a pair.
 */
export const BACKGROUNDS: Background[] = [
  {
    id: "cat-studying",
    name: "Cat Studying",
    type: "video",
    assetUrl: "/backgrounds/cat-studying.mp4",
    mood: "cozy",
  },
];

export function getBackground(id?: string): Background | undefined {
  if (!id) return undefined;
  return BACKGROUNDS.find((b) => b.id === id);
}
