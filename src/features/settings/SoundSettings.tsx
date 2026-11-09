"use client";

import { Volume2Icon } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { usePomodoroConfigStore } from "@/features/pomodoro/store";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { SoundList, type SoundAssignment } from "./SoundList";

export function SoundSettings() {
  const { settings, update } = useSettingsStore();
  const pomodoro = usePomodoroConfigStore((s) => s.config);
  const updatePomodoro = usePomodoroConfigStore((s) => s.update);

  const assignments: SoundAssignment[] = [
    {
      label: "Target end",
      chip: "Target",
      value: settings.completionSoundId,
      onChange: (completionSoundId) => update({ completionSoundId }),
    },
    {
      label: "Pomodoro break",
      chip: "Break",
      value: pomodoro.breakSoundId,
      onChange: (breakSoundId) => updatePomodoro({ breakSoundId }),
    },
    {
      label: "Pomodoro end",
      chip: "End",
      value: pomodoro.endSoundId,
      onChange: (endSoundId) => updatePomodoro({ endSoundId }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-medium">Sound</h2>
        <p className="text-sm text-muted-foreground">
          Playback and notification sounds, stored locally in your browser.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-sm font-medium">Playback</h3>

        <Field>
          <FieldLabel>Default volume</FieldLabel>
          <div className="flex flex-row items-center gap-3">
            <Volume2Icon className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              aria-label="Default music volume"
              className="w-full"
              min={0}
              max={1}
              step={0.01}
              value={[settings.musicVolume]}
              onValueChange={(value) => {
                const volume = value[0] ?? 0;
                update({ musicVolume: volume });
                musicPlayer.setVolume(volume);
              }}
            />
            <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </div>
        </Field>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-medium">Notification sounds</h3>
        <p className="text-sm text-muted-foreground">
          Preview a sound, then choose where it plays. A sound can be used for more
          than one moment.
        </p>

        <SoundList assignments={assignments} />
      </section>
    </div>
  );
}
