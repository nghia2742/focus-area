"use client";

import { useState } from "react";
import {
  CheckIcon,
  MusicIcon,
  PlayIcon,
  TimerIcon,
  TimerOffIcon,
  VolumeXIcon,
  type LucideIcon,
} from "lucide-react";
import type { FocusMode } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { getMusicTrack } from "@/data/music";
import { EnvironmentThumb } from "@/components/media/EnvironmentThumb";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusStore } from "@/store/focusStore";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { requestNotificationPermission } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

type DurationChoice = "25" | "50" | "90" | "custom";

function SkeletonCard() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-12">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function FocusSetup() {
  const hydrated = useSettingsStore((s) => s.hydrated);

  // Gate on hydration so the form mounts with persisted settings as initial
  // state — no effect-sync required.
  if (!hydrated) return <SkeletonCard />;
  return <SetupForm />;
}

function SetupForm() {
  const { settings, update } = useSettingsStore();
  const startSession = useFocusStore((s) => s.start);

  const [taskName, setTaskName] = useState("");
  const [mode, setMode] = useState<FocusMode>(settings.defaultMode);
  const [durationChoice, setDurationChoice] = useState<DurationChoice>(() => {
    const preset = FOCUS_DURATION_PRESETS.find((p) => p === settings.defaultDuration);
    return preset ? (String(preset) as DurationChoice) : "custom";
  });
  const [customMinutes, setCustomMinutes] = useState(() =>
    FOCUS_DURATION_PRESETS.includes(settings.defaultDuration)
      ? ""
      : String(settings.defaultDuration),
  );
  const [durationError, setDurationError] = useState<string | null>(null);
  const [environmentId, setEnvironmentId] = useState<string | undefined>(
    settings.rememberLastEnvironment ? settings.lastEnvironmentId : undefined,
  );

  const resolvedDuration = (): number | null => {
    if (mode !== "target") return null;
    if (durationChoice === "custom") {
      const n = Number.parseInt(customMinutes, 10);
      if (!Number.isFinite(n) || n < 1 || n > 600) return null;
      return n;
    }
    return Number.parseInt(durationChoice, 10);
  };

  const handleStart = () => {
    let targetDuration: number | undefined;
    if (mode === "target") {
      const d = resolvedDuration();
      if (d == null) {
        setDurationError("Enter a duration between 1 and 600 minutes.");
        return;
      }
      targetDuration = d;
    }

    const environment = getEnvironment(environmentId);
    const musicId = environment?.musicId;
    const backgroundId = environment?.backgroundId;

    startSession({
      taskName,
      mode,
      targetDuration,
      musicId,
      backgroundId,
    });

    // Remember the last atmosphere if the user wants to.
    if (settings.rememberLastEnvironment) update({ lastEnvironmentId: environmentId });

    // Kick off audio inside the click gesture to satisfy autoplay rules.
    musicPlayer.setVolume(settings.musicVolume);
    if (musicId) void musicPlayer.setTrack(musicId);
    else musicPlayer.stop();

    requestNotificationPermission();
  };

  const customInvalid =
    durationChoice === "custom" && mode === "target" && resolvedDuration() == null;

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="ambient-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-14 sm:gap-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            What are you working on?
          </h1>
          <p className="max-w-md text-[0.95rem] text-muted-foreground">
            Set an intention, then disappear into it.
          </p>
        </div>

        <FieldGroup className="gap-8">
          <Field>
            <FieldLabel htmlFor="task-name">Task (optional)</FieldLabel>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Learn PostgreSQL"
              autoComplete="off"
              className="h-12 rounded-2xl px-4 text-base shadow-[inset_0_1px_0_oklch(1_0_0/0.4)] md:text-base"
            />
          </Field>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Mode</span>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v) {
                  setMode(v as FocusMode);
                  setDurationError(null);
                }
              }}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem value="open" className="flex-1 gap-2 rounded-xl py-2.5">
                <TimerOffIcon />
                <span>Open Focus</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="target" className="flex-1 gap-2 rounded-xl py-2.5">
                <TimerIcon />
                <span>Target Focus</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {mode === "target" && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Duration</span>
              <ToggleGroup
                type="single"
                value={durationChoice}
                onValueChange={(v) => {
                  if (v) setDurationChoice(v as DurationChoice);
                  setDurationError(null);
                }}
                variant="outline"
                className="w-full"
              >
                {FOCUS_DURATION_PRESETS.map((d) => (
                  <ToggleGroupItem key={d} value={String(d)} className="flex-1 rounded-xl py-2.5">
                    {d}m
                  </ToggleGroupItem>
                ))}
                <ToggleGroupItem value="custom" className="flex-1 rounded-xl py-2.5">
                  Custom
                </ToggleGroupItem>
              </ToggleGroup>
              {durationChoice === "custom" && (
                <Field data-invalid={customInvalid || undefined}>
                  <FieldLabel htmlFor="custom-duration">Custom duration (minutes)</FieldLabel>
                  <Input
                    id="custom-duration"
                    type="number"
                    min={1}
                    max={600}
                    inputMode="numeric"
                    value={customMinutes}
                    onChange={(e) => {
                      setCustomMinutes(e.target.value);
                      setDurationError(null);
                    }}
                    placeholder="e.g. 45"
                    aria-invalid={customInvalid || undefined}
                    className="h-12 rounded-2xl px-4 text-base md:text-base"
                  />
                  {customInvalid && (
                    <FieldDescription>
                      Enter a duration between 1 and 600 minutes.
                    </FieldDescription>
                  )}
                </Field>
              )}
              {durationError && !customInvalid && (
                <p className="text-sm text-destructive" role="alert">
                  {durationError}
                </p>
              )}
            </div>
          )}
        </FieldGroup>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Environment</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {ENVIRONMENTS.map((env) => {
              const selected = environmentId === env.id;
              const Icon: LucideIcon = env.musicId ? MusicIcon : VolumeXIcon;
              const track = env.musicId ? getMusicTrack(env.musicId) : undefined;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => setEnvironmentId(env.id)}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-2xl border text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-accent-vivid/50 bg-accent-vivid/5 shadow-[0_0_0_1px_oklch(0.66_0.15_58/0.45)]"
                      : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_16px_40px_-20px_oklch(0.19_0.03_55/0.45)]",
                  )}
                  aria-pressed={selected}
                >
                  <span className="relative">
                    <EnvironmentThumb env={env} className="aspect-[16/10] w-full" />
                    {selected && (
                      <span className="absolute top-2.5 right-2.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-vivid text-primary-foreground shadow-[0_4px_12px_-2px_oklch(0.19_0.03_55/0.5)]">
                        <CheckIcon className="size-3.5" />
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-3 p-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                          selected
                            ? "bg-accent-vivid/15 text-accent-vivid"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{env.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {track ? track.name : "No music"}
                        </span>
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Music and background always come as a pair.
          </p>
        </div>

        <Button
          size="lg"
          className="group/start h-14 w-full rounded-full px-3 text-base font-semibold shadow-[0_16px_48px_-16px_oklch(0.66_0.15_58/0.7)]"
          onClick={handleStart}
        >
          <span className="flex-1 text-center">Start Focus</span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-105 group-active/start:scale-95">
            <PlayIcon className="size-4 fill-current" />
          </span>
        </Button>
      </div>
    </div>
  );
}
