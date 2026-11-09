"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";
import { COMPLETION_SOUNDS } from "@/data/sounds";
import { useSoundStore } from "@/store/soundStore";
import { playCompletionSound } from "@/lib/audio/completionSound";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export interface SoundAssignment {
  label: string;
  /** Short label shown on the chip. */
  chip: string;
  value: string;
  onChange: (soundId: string) => void;
}

interface SoundListProps {
  assignments: SoundAssignment[];
}

/** One list of sounds: preview each, assign it to any of the notification moments. */
export function SoundList({ assignments }: SoundListProps) {
  const customSounds = useSoundStore((s) => s.customSounds);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const preview = (soundId: string) => {
    playCompletionSound(soundId);
    // The shared player does not report duration; pulse the icon for a moment.
    setPreviewing(soundId);
    window.setTimeout(() => {
      setPreviewing((current) => (current === soundId ? null : current));
    }, 1200);
  };

  return (
    <ul className="flex flex-col gap-1.5">
      {[...COMPLETION_SOUNDS, ...customSounds].map((sound) => (
        <li
          key={sound.id}
          className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Preview ${sound.name}`}
              onClick={() => preview(sound.id)}
            >
              <PlayIcon className={previewing === sound.id ? "text-primary" : undefined} />
            </Button>
            <span className="truncate text-sm">{sound.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {assignments.map((assignment) => (
              <Toggle
                key={assignment.label}
                variant="solid"
                size="sm"
                pressed={assignment.value === sound.id}
                aria-label={`Use ${sound.name} for ${assignment.label}`}
                onPressedChange={() => assignment.onChange(sound.id)}
              >
                {assignment.chip}
              </Toggle>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
