"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon, Volume2Icon } from "lucide-react";
import type { FocusMode, ThemePreference } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { useSettingsStore } from "@/store/settingsStore";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const hydrated = useSettingsStore((s) => s.hydrated);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] w-full overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {!hydrated ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl sm:col-start-2 sm:row-span-2" />
            <Skeleton className="h-36 w-full rounded-2xl sm:col-start-1 sm:row-start-2" />
          </div>
        ) : (
          <SettingsForm />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm() {
  const { settings, update } = useSettingsStore();
  const { setTheme } = useTheme();
  const [customDuration, setCustomDuration] = useState(() =>
    FOCUS_DURATION_PRESETS.includes(settings.defaultDuration)
      ? ""
      : String(settings.defaultDuration),
  );

  const handleTheme = (value: string) => {
    const theme = value as ThemePreference;
    update({ theme });
    setTheme(theme);
  };

  const handleDefaultDuration = (minutes: number) => update({ defaultDuration: minutes });

  const handleCustomDurationBlur = () => {
    const n = Number.parseInt(customDuration, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 600) {
      update({ defaultDuration: n });
    } else {
      setCustomDuration(String(settings.defaultDuration));
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FieldSet>
        <FieldLegend>Appearance</FieldLegend>
        <FieldDescription>Choose how Focus looks.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Theme"
          value={settings.theme}
          onValueChange={handleTheme}
          variant="outline"
          className="w-full"
        >
          {THEME_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value} className="flex-1 gap-2">
              <opt.icon />
              <span>{opt.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>

      <FieldSet className="sm:col-start-2 sm:row-span-2">
        <FieldLegend>Timer</FieldLegend>
        <FieldDescription>Defaults for a new session.</FieldDescription>
        <Field>
          <FieldLabel>Default mode</FieldLabel>
          <ToggleGroup
            type="single"
            aria-label="Default focus mode"
            value={settings.defaultMode}
            onValueChange={(v) => v && update({ defaultMode: v as FocusMode })}
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
          <FieldContent className="flex flex-col gap-2">
            <ToggleGroup
              type="single"
              aria-label="Default target duration"
              value={
                FOCUS_DURATION_PRESETS.includes(settings.defaultDuration)
                  ? String(settings.defaultDuration)
                  : "custom"
              }
              onValueChange={(v) => {
                if (v && v !== "custom") handleDefaultDuration(Number(v));
              }}
              variant="outline"
              className="w-full"
            >
              {FOCUS_DURATION_PRESETS.map((d) => (
                <ToggleGroupItem key={d} value={String(d)} className="flex-1">
                  {d}m
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
                onChange={(e) => setCustomDuration(e.target.value)}
                onBlur={handleCustomDurationBlur}
              />
            )}
          </FieldContent>
        </Field>
      </FieldSet>

      <FieldSet className="sm:col-start-1 sm:row-start-2">
        <FieldLegend>Sound</FieldLegend>
        <FieldDescription>How your focus atmosphere behaves.</FieldDescription>
        <Field orientation="responsive">
          <FieldLabel>Default volume</FieldLabel>
          <FieldContent className="flex flex-row items-center gap-3">
            <Volume2Icon className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              aria-label="Default music volume"
              className="w-full"
              min={0}
              max={1}
              step={0.01}
              value={[settings.musicVolume]}
              onValueChange={(v) => {
                const vol = v[0] ?? 0;
                update({ musicVolume: vol });
                musicPlayer.setVolume(vol);
              }}
            />
            <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Remember last environment</FieldLabel>
          <FieldContent>
            <Switch
              checked={settings.rememberLastEnvironment}
              onCheckedChange={(checked) => update({ rememberLastEnvironment: checked })}
            />
          </FieldContent>
        </Field>
      </FieldSet>
    </div>
  );
}
