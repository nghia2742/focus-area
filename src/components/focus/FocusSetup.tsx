"use client";

import { useState } from "react";
import { MusicIcon, PlayIcon, TimerIcon, TimerOffIcon, VolumeXIcon } from "lucide-react";
import type { FocusMode } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusStore } from "@/store/focusStore";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { requestNotificationPermission } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-10 sm:py-14">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What are you working on?
        </h1>
        <p className="text-sm text-muted-foreground">One thing. Right now.</p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="task-name">Task (optional)</FieldLabel>
          <Input
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. Learn PostgreSQL"
            autoComplete="off"
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-2">
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
          <ToggleGroupItem value="open" className="flex-1 gap-2">
            <TimerOffIcon />
            <span>Open Focus</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="target" className="flex-1 gap-2">
            <TimerIcon />
            <span>Target Focus</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === "target" && (
        <div className="flex flex-col gap-2">
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
              <ToggleGroupItem key={d} value={String(d)} className="flex-1">
                {d}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value="custom" className="flex-1">
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
              />
              {customInvalid && (
                <FieldDescription>Enter a duration between 1 and 600 minutes.</FieldDescription>
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

      <Separator className="my-1" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Environment</span>
        <ToggleGroup
          type="single"
          value={environmentId ?? ""}
          onValueChange={(v) => {
            if (v) setEnvironmentId(v);
          }}
          variant="outline"
          className="w-full"
        >
          {ENVIRONMENTS.map((env) => {
            const Icon = env.musicId ? MusicIcon : VolumeXIcon;
            return (
              <ToggleGroupItem key={env.id} value={env.id} className="flex-1 gap-2">
                <Icon />
                <span>{env.name}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Music and background always come as a pair.
        </p>
      </div>

      <Button
        size="lg"
        className="mt-2 h-11 w-full rounded-xl text-base font-semibold"
        onClick={handleStart}
      >
        <PlayIcon data-icon="inline-start" />
        Start Focus
      </Button>
    </div>
  );
}
