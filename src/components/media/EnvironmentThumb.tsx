"use client";

import type { Environment } from "@/types/focus";
import { getEnvironmentVisual } from "@/data/backgrounds";
import { cn } from "@/lib/utils";

interface EnvironmentThumbProps {
  env: Environment;
  className?: string;
}

/**
 * The visual for an environment card/row: the paired background's static
 * thumbnail when available, otherwise a designed flat-cozy scene (dusk
 * window, desk lamp, plant) in the same style as the video backgrounds —
 * no flat-gray placeholders.
 */
export function EnvironmentThumb({ env, className }: EnvironmentThumbProps) {
  const { imageUrl } = getEnvironmentVisual(env);

  return (
    <span
      aria-hidden
      className={cn("relative block overflow-hidden", className)}
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
        <CozyScene />
      )}
      {imageUrl && (
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      )}
    </span>
  );
}

/** Flat, cozy dusk study-corner illustration (fallback for e.g. Quiet). */
function CozyScene() {
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="qs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1b10" />
          <stop offset="1" stopColor="#170e08" />
        </linearGradient>
        <linearGradient id="qs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0a1c" />
          <stop offset="1" stopColor="#2a1730" />
        </linearGradient>
        <radialGradient id="qs-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4a94f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4a94f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="qs-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6d9a0" />
          <stop offset="1" stopColor="#eab868" />
        </radialGradient>
      </defs>

      <rect width="400" height="250" fill="url(#qs-wall)" />

      {/* Window with night sky + moon */}
      <rect x="32" y="30" width="132" height="100" rx="10" fill="#3a2418" />
      <rect x="40" y="38" width="116" height="84" rx="6" fill="url(#qs-sky)" />
      <circle cx="84" cy="66" r="15" fill="url(#qs-moon)" opacity="0.95" />
      <circle cx="132" cy="94" r="24" fill="#f4a94f" opacity="0.06" />
      <path d="M98 38v84M40 80h116" stroke="#2a1a12" strokeWidth="4" />

      {/* Desk with warm lamp glow */}
      <ellipse cx="302" cy="200" rx="64" ry="28" fill="url(#qs-lamp)" />
      <rect x="0" y="196" width="400" height="54" rx="10" fill="#33200f" />
      <rect x="0" y="196" width="400" height="9" rx="4" fill="#452c18" />

      {/* Desk lamp */}
      <rect x="298" y="170" width="8" height="28" rx="2" fill="#593722" />
      <path d="M268 174h70l-10 20h-50z" fill="#6b452a" />

      {/* Plant in a pot */}
      <rect x="46" y="176" width="36" height="20" rx="5" fill="#4a2e1a" />
      <path d="M64 176c-1-24-18-28-21-42 12 4 15 15 21 22 5-12 9-24 26-26-5 13-17 20-20 30 1 16-3 16-6 16z" fill="#3f6d3a" />

      {/* Mug of coffee */}
      <rect x="140" y="166" width="20" height="30" rx="5" fill="#7a4a2a" />
      <path d="M160 172q11 3 11 12 0 9-11 12" stroke="#7a4a2a" strokeWidth="3" fill="none" />
      <rect x="143" y="184" width="14" height="5" rx="2" fill="#2a1608" />

      {/* Stacked books */}
      <rect x="172" y="184" width="46" height="6" rx="2" fill="#5a3a20" />
      <rect x="172" y="190" width="40" height="6" rx="2" fill="#3f6d3a" />
      <rect x="172" y="196" width="34" height="4" rx="2" fill="#8a5a30" />
    </svg>
  );
}
