import type { Environment } from "@/types/focus";

/**
 * The available atmospheres. Music and background always come as a pair:
 * picking an environment applies both its audio track and its background.
 */
export const ENVIRONMENTS: Environment[] = [
  {
    id: "quiet",
    name: "Quiet",
    description: "Pure silence for deep work",
    category: "quiet",
    musicId: undefined,
    backgroundId: undefined,
  },
  {
    id: "late-night-study",
    name: "Late Night Study",
    description: "Rain and jazz for city nights",
    category: "study",
    musicId: "late-night-study",
    backgroundId: "cat-studying",
  },
];

export function getEnvironment(id?: string): Environment | undefined {
  if (!id) return undefined;
  return ENVIRONMENTS.find((e) => e.id === id);
}
