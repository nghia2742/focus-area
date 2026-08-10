"use client";

import { ListMusicIcon, PauseIcon, PlayIcon, RefreshCwIcon, Volume2Icon } from "lucide-react";
import { getMusicTrack } from "@/data/music";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  onOpenSelector?: () => void;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

/**
 * Live music controls bound to the shared audio controller. Renders the
 * current track, play/pause, volume, and (optionally) a button to open the
 * track picker. Falls back to a "Music unavailable" state on audio errors
 * without affecting the focus timer.
 */
export function MusicPlayer({
  onOpenSelector,
  onVolumeChange,
  className,
}: MusicPlayerProps) {
  const { trackId, isPlaying, volume, error, toggle, setVolume, retry } =
    useMusicPlayer();

  if (error) {
    return (
      <div className={cn("glass flex items-center gap-2 rounded-full px-4 py-2", className)}>
        <span className="text-sm text-muted-foreground">Music unavailable</span>
        <Button variant="ghost" size="icon-sm" onClick={retry} aria-label="Retry music">
          <RefreshCwIcon />
        </Button>
      </div>
    );
  }

  const track = getMusicTrack(trackId);
  const label = track ? `${track.name} · ${track.category}` : "Quiet";

  return (
    <div
      className={cn(
        "glass flex flex-wrap items-center justify-center gap-2 rounded-full px-3 py-2 sm:gap-3",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>

      <span className="max-w-40 truncate text-sm font-medium sm:max-w-none">{label}</span>

      <div className="hidden items-center gap-2 sm:flex">
        <Volume2Icon className="size-4 text-muted-foreground" />
        <Slider
          aria-label="Music volume"
          className="w-24"
          min={0}
          max={1}
          step={0.01}
          value={[volume]}
          onValueChange={(v) => {
            setVolume(v[0] ?? 0);
            onVolumeChange?.(v[0] ?? 0);
          }}
        />
      </div>

      {onOpenSelector && (
        <Button variant="ghost" size="icon-sm" onClick={onOpenSelector} aria-label="Change environment">
          <ListMusicIcon />
        </Button>
      )}
    </div>
  );
}
