"use client";

import { useState } from "react";
import { Volume2Icon } from "lucide-react";
import type { FocusMode } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppearance } from "@/components/providers/AppearanceProvider";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { DEFAULT_SETTINGS } from "@/lib/storage/localStorage";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function GeneralSettings() {
  const { settings, update, resetSettings } = useSettingsStore();
  const { resetAppearance } = useAppearance();
  const [customDuration, setCustomDuration] = useState(() =>
    FOCUS_DURATION_PRESETS.includes(settings.defaultDuration)
      ? ""
      : String(settings.defaultDuration),
  );
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleDefaultDuration = (minutes: number) => {
    setCustomDuration("");
    update({ defaultDuration: minutes });
  };

  const handleCustomDurationBlur = () => {
    const n = Number.parseInt(customDuration, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 600) {
      update({ defaultDuration: n });
    } else {
      setCustomDuration(String(settings.defaultDuration));
    }
  };

  const handleResetAll = () => {
    resetSettings();
    resetAppearance();
    setCustomDuration("");
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
              if (value === "open" || value === "target") {
                update({ defaultMode: value as FocusMode });
              }
            }}
            variant="outline"
            className="w-full"
          >
            <ToggleGroupItem value="open" className="flex-1">
              Open Focus
            </ToggleGroupItem>
            <ToggleGroupItem value="target" className="flex-1">
              Target Focus
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Default target duration</FieldLabel>
          <div className="flex flex-col gap-2">
            <ToggleGroup
              type="single"
              aria-label="Default target duration"
              value={
                FOCUS_DURATION_PRESETS.includes(settings.defaultDuration)
                  ? String(settings.defaultDuration)
                  : "custom"
              }
              onValueChange={(value) => {
                if (value && value !== "custom") handleDefaultDuration(Number(value));
              }}
              variant="outline"
              className="w-full"
            >
              {FOCUS_DURATION_PRESETS.map((duration) => (
                <ToggleGroupItem
                  key={duration}
                  value={String(duration)}
                  className="flex-1"
                >
                  {duration}m
                </ToggleGroupItem>
              ))}
              <ToggleGroupItem value="custom" className="flex-1">
                Custom
              </ToggleGroupItem>
            </ToggleGroup>
            {!FOCUS_DURATION_PRESETS.includes(settings.defaultDuration) && (
              <Input
                type="number"
                min={1}
                max={600}
                inputMode="numeric"
                aria-label="Custom default duration in minutes"
                value={customDuration}
                onChange={(event) => setCustomDuration(event.target.value)}
                onBlur={handleCustomDurationBlur}
              />
            )}
          </div>
        </Field>
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
