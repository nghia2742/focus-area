"use client";

import { VolumeXIcon } from "lucide-react";
import type { Environment } from "@/types/focus";
import { getEnvironmentVisual } from "@/data/backgrounds";
import { cn } from "@/lib/utils";

interface EnvironmentThumbProps {
  env: Environment;
  className?: string;
}

/**
 * The visual for an environment card/row: the paired background's static
 * thumbnail when available, otherwise a mood-derived gradient (with a muted
 * glyph for environments without a background, e.g. Quiet).
 */
export function EnvironmentThumb({ env, className }: EnvironmentThumbProps) {
  const { imageUrl, gradient } = getEnvironmentVisual(env);

  return (
    <span
      aria-hidden
      className={cn("relative block overflow-hidden", className)}
      style={imageUrl ? undefined : { background: gradient }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- thumbnail of a video background
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="noise absolute inset-0 opacity-40" />
      )}
      {!imageUrl && !env.backgroundId && (
        <span className="absolute inset-0 flex items-center justify-center">
          <VolumeXIcon className="size-5 text-white/70" />
        </span>
      )}
      {imageUrl && (
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      )}
    </span>
  );
}
