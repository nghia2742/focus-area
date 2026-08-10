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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
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
      <DialogContent className="max-h-[85dvh] w-full overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {!hydrated ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Focus looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timer</CardTitle>
          <CardDescription>Defaults for a new session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field>
            <FieldLabel>Default mode</FieldLabel>
            <ToggleGroup
              type="single"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sound</CardTitle>
          <CardDescription>How your focus atmosphere behaves.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
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
        </CardContent>
      </Card>
    </div>
  );
}
