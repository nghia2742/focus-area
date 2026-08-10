"use client";

import { CheckIcon, MusicIcon, VolumeXIcon, type LucideIcon } from "lucide-react";
import { ENVIRONMENTS } from "@/data/environments";
import { getMusicTrack } from "@/data/music";
import { cn } from "@/lib/utils";

interface EnvironmentSelectorProps {
  value?: string;
  onChange: (id: string) => void;
  compact?: boolean;
}

/**
 * Lists the available atmospheres. Music and background are a pair, so
 * picking an environment applies both its audio track and its background.
 */
export function EnvironmentSelector({
  value,
  onChange,
  compact,
}: EnvironmentSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {ENVIRONMENTS.map((env) => {
        const selected = value === env.id;
        const track = env.musicId ? getMusicTrack(env.musicId) : undefined;
        const Icon: LucideIcon = env.musicId ? MusicIcon : VolumeXIcon;
        return (
          <button
            key={env.id}
            type="button"
            onClick={() => onChange(env.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border text-left transition-colors",
              compact ? "px-3 py-2" : "px-3.5 py-3",
              selected
                ? "border-accent-vivid bg-accent-vivid/10 text-foreground"
                : "border-border bg-card hover:border-foreground/20",
            )}
            aria-pressed={selected}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{env.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {track ? track.name : "No music"}
              </span>
            </span>
            {selected && <CheckIcon className="size-4 shrink-0 text-accent-vivid" />}
          </button>
        );
      })}
    </div>
  );
}
