"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const BACKGROUND_SRC = "/backgrounds/270507_small.mp4";

/** Full-bleed artwork used as the default background (setup + quiet sessions). */
export function MainBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [reducedMotion]);

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        src={BACKGROUND_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="size-full object-cover"
      />
      <div className="scrim absolute inset-0" />
      <div className="noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}
