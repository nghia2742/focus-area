"use client";

import { useState } from "react";
import { Volume2Icon } from "lucide-react";
import type { FocusMode } from "@/types/focus";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppearance } from "@/components/providers/AppearanceProvider";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { DEFAULT_SETTINGS } from "@/lib/storage/localStorage";
import { usePomodoroConfigStore } from "@/features/pomodoro/store";
import { PomodoroSettings } from "@/features/pomodoro/PomodoroSettings";
import { DurationField } from "@/components/shared/DurationField";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function GeneralSettings() {
  const { settings, update, resetSettings } = useSettingsStore();
  const pomodoroConfig = usePomodoroConfigStore((s) => s.config);
  const updatePomodoro = usePomodoroConfigStore((s) => s.update);
  const resetPomodoro = usePomodoroConfigStore((s) => s.reset);
  const { resetAppearance } = useAppearance();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleResetAll = () => {
    resetSettings();
    resetPomodoro();
    resetAppearance();
    setConfirmingReset(false);
    musicPlayer.setVolume(DEFAULT_SETTINGS.musicVolume);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-medium">General</h2>
        <p className="text-sm text-muted-foreground">
          Configure timer defaults, sound and application preferences.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-sm font-medium">Timer</h3>

        <Field>
          <FieldLabel>Default mode</FieldLabel>
          <ToggleGroup
            type="single"
            aria-label="Default focus mode"
            value={settings.defaultMode}
            onValueChange={(value) => {
              if (value === "open" || value === "target" || value === "pomodoro") {
                update({ defaultMode: value as FocusMode });
              }
            }}
            variant="outline"
            className="w-full"
          >
            <ToggleGroupItem value="open" className="flex-1">
              Open
            </ToggleGroupItem>
            <ToggleGroupItem value="target" className="flex-1">
              Target
            </ToggleGroupItem>
            <ToggleGroupItem value="pomodoro" className="flex-1">
              Pomodoro
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {settings.defaultMode === "target" && (
          <DurationField
            label="Default target duration"
            value={settings.defaultDuration}
            onChange={(defaultDuration) => update({ defaultDuration })}
          />
        )}

        {settings.defaultMode === "pomodoro" && (
          <PomodoroSettings config={pomodoroConfig} onChange={updatePomodoro} />
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-sm font-medium">Sound</h3>

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

        <Field orientation="horizontal">
          <FieldLabel>Remember last environment</FieldLabel>
          <Switch
            aria-label="Remember last environment"
            checked={settings.rememberLastEnvironment}
            onCheckedChange={(checked) => update({ rememberLastEnvironment: checked })}
          />
        </Field>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-medium">Application</h3>
        {confirmingReset ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm">
              This resets appearance, timer and sound preferences. It cannot be undone.
            </p>
            <div className="flex flex-row gap-2">
              <Button variant="destructive" size="sm" autoFocus onClick={handleResetAll}>
                Reset everything
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmingReset(true)}
            >
              Reset all settings
            </Button>
            <p className="text-xs text-muted-foreground">
              Restores every preference to its default.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
