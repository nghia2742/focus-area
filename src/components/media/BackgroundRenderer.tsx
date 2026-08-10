"use client";

import { useState } from "react";
import type { Background } from "@/types/focus";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface BackgroundRendererProps {
  background?: Background;
  className?: string;
  overlayClassName?: string;
}

/**
 * Renders the immersive full-viewport background with a dark overlay so text
 * stays readable. Video backgrounds fall back to their static image on error
 * or when the user prefers reduced motion.
 */
export function BackgroundRenderer({
  background,
  className,
  overlayClassName,
}: BackgroundRendererProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo =
    background?.type === "video" && !reducedMotion && !videoFailed;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {showVideo && background ? (
        <video
          key={background.id}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={background.thumbnailUrl ?? background.assetUrl}
          onError={() => setVideoFailed(true)}
        >
          <source src={background.assetUrl} />
        </video>
      ) : background ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed background
        <img
          key={background.id}
          src={background.assetUrl}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60",
          overlayClassName,
        )}
      />
    </div>
  );
}
