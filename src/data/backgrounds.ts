import type { Background, Environment } from "@/types/focus";

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
    thumbnailUrl: "/backgrounds/cat-studying.jpg",
    mood: "cozy",
  },
];

export function getBackground(id?: string): Background | undefined {
  if (!id) return undefined;
  return BACKGROUNDS.find((b) => b.id === id);
}

/**
 * Fallback gradients keyed by background `mood`, used wherever a static
 * thumbnail is not available yet (e.g. future environments).
 */
const MOOD_GRADIENT: Record<string, string> = {
  cozy: "linear-gradient(135deg, oklch(0.18 0.03 55), oklch(0.45 0.11 52))",
  default: "linear-gradient(135deg, oklch(0.28 0.03 55), oklch(0.5 0.09 48))",
};

export interface EnvironmentVisual {
  imageUrl?: string;
  gradient: string;
}

/**
 * The card/dialog visual for an environment: the paired background's static
 * thumbnail when available, otherwise a gradient derived from its mood (or a
 * neutral one for environments without a background, e.g. Quiet).
 */
export function getEnvironmentVisual(env: Environment | undefined): EnvironmentVisual {
  const background = env ? getBackground(env.backgroundId) : undefined;
  const imageUrl = background?.thumbnailUrl;
  const gradient = MOOD_GRADIENT[background?.mood ?? "default"] ?? MOOD_GRADIENT.default;
  return { imageUrl, gradient };
}
