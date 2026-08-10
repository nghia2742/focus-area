"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutGridIcon,
  PlayIcon,
  TimerIcon,
  TimerOffIcon,
} from "lucide-react";
import type { Environment, FocusMode } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { EnvironmentThumb } from "@/components/media/EnvironmentThumb";
import { EnvironmentBrowseSheet } from "@/components/media/EnvironmentBrowseSheet";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusStore } from "@/store/focusStore";
import { musicPlayer } from "@/lib/audio/musicPlayer";
import { requestNotificationPermission } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DurationChoice = "25" | "50" | "90" | "custom";

/** Dark-surface styling shared by the mode/duration toggle segments. */
const darkToggleItem =
  "flex-1 gap-2 rounded-full border-white/12 bg-white/6 py-2 text-white/70 hover:bg-white/10 hover:text-white data-[state=on]:border-accent-orange data-[state=on]:bg-accent-orange/15 data-[state=on]:text-accent-orange [&_svg]:opacity-60 data-[state=on]:[&_svg]:opacity-100";

/** Dark-surface styling shared by text/number inputs on the glass card. */
const darkInput =
  "h-11 rounded-full border-white/12 bg-white/6 px-5 text-base text-white placeholder:text-white/40 shadow-none focus-visible:border-accent-orange focus-visible:ring-3 focus-visible:ring-accent-orange/30 focus-visible:bg-white/9 md:text-base";

function SkeletonCard() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col justify-center px-4 sm:px-6">
      <div className="glass-card my-4 flex w-full flex-col rounded-2xl p-5 sm:my-6 sm:rounded-3xl sm:p-6">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
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
  const [environmentId, setEnvironmentId] = useState<string>(
    settings.rememberLastEnvironment && settings.lastEnvironmentId
      ? settings.lastEnvironmentId
      : ENVIRONMENTS[0].id,
  );
  const [browseOpen, setBrowseOpen] = useState(false);

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

    const environment = getEnvironment(environmentId) ?? ENVIRONMENTS[0];
    const musicId = environment.musicId;
    const backgroundId = environment.backgroundId;

    startSession({
      taskName,
      mode,
      targetDuration,
      musicId,
      backgroundId,
    });

    // Remember the last atmosphere if the user wants to.
    if (settings.rememberLastEnvironment) update({ lastEnvironmentId: environment.id });

    // Kick off audio inside the click gesture to satisfy autoplay rules.
    musicPlayer.setVolume(settings.musicVolume);
    if (musicId) void musicPlayer.setTrack(musicId);
    else musicPlayer.stop();

    requestNotificationPermission();
  };

  const customInvalid =
    durationChoice === "custom" && mode === "target" && resolvedDuration() == null;

  const env = getEnvironment(environmentId) ?? ENVIRONMENTS[0];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col justify-center px-4 sm:px-6">
        <motion.div
          initial={{ scale: 0.97, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="glass-card my-4 flex min-h-0 max-h-[680px] w-full flex-1 flex-col overflow-y-auto rounded-2xl p-5 sm:my-6 sm:rounded-3xl sm:p-6"
        >
          <div className="mb-6 flex shrink-0 flex-col gap-2">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-white">
              What are you working on?
            </h1>
            <p className="text-[15px] text-white/68">
              Set an intention, then disappear into it.
            </p>
          </div>

          <FieldGroup className="shrink-0 gap-5">
            <Field>
              <FieldLabel htmlFor="task-name" className="text-white">
                Task (optional)
              </FieldLabel>
              <Input
                id="task-name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Learn PostgreSQL"
                autoComplete="off"
                className={darkInput}
              />
            </Field>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-white">Mode</span>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(v) => {
                  if (v) {
                    setMode(v as FocusMode);
                    setDurationError(null);
                  }
                }}
                spacing={3}
                className="w-full"
              >
                <ToggleGroupItem value="open" className={darkToggleItem}>
                  <TimerOffIcon />
                  <span>Open Focus</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="target" className={darkToggleItem}>
                  <TimerIcon />
                  <span>Target Focus</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </FieldGroup>

          <AnimatePresence initial={false}>
            {mode === "target" && (
              <motion.div
                key="duration-section"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-5">
                  <span className="text-sm font-semibold text-white">Duration</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <ToggleGroup
                      type="single"
                      value={
                        FOCUS_DURATION_PRESETS.includes(Number(durationChoice))
                          ? durationChoice
                          : ""
                      }
                      onValueChange={(v) => {
                        if (v) setDurationChoice(v as DurationChoice);
                        setDurationError(null);
                      }}
                      spacing={2}
                      className="min-w-0 flex-1"
                    >
                      {FOCUS_DURATION_PRESETS.map((d) => (
                        <ToggleGroupItem key={d} value={String(d)} className={darkToggleItem}>
                          {d}m
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>

                    <div
                      className={cn(
                        "flex h-8 min-w-[150px] items-center gap-1.5 rounded-full border bg-white/6 pr-4 pl-4 transition-colors focus-within:ring-3",
                        customInvalid
                          ? "border-red-400/70 focus-within:border-red-400/70 focus-within:ring-red-400/30"
                          : durationChoice === "custom"
                            ? "border-accent-orange bg-accent-orange/15 focus-within:border-accent-orange focus-within:ring-accent-orange/30"
                            : "border-white/12 focus-within:border-accent-orange focus-within:ring-accent-orange/30",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold whitespace-nowrap",
                          durationChoice === "custom" ? "text-accent-orange" : "text-white/70",
                        )}
                      >
                        Custom
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={600}
                        inputMode="numeric"
                        aria-label="Custom duration in minutes"
                        aria-invalid={customInvalid || undefined}
                        value={customMinutes}
                        onChange={(e) => {
                          setCustomMinutes(e.target.value);
                          setDurationChoice("custom");
                          setDurationError(null);
                        }}
                        placeholder="45"
                        className="h-full w-full min-w-0 bg-transparent text-right text-base font-semibold text-white outline-none placeholder:text-white/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-sm whitespace-nowrap text-white/50">min</span>
                    </div>
                  </div>
                  {customInvalid && (
                    <p className="text-sm text-red-300" role="alert">
                      Enter a duration between 1 and 600 minutes.
                    </p>
                  )}
                  {durationError && !customInvalid && (
                    <p className="text-sm text-red-300" role="alert">
                      {durationError}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 flex min-h-[150px] flex-1 flex-col">
            <div className="mb-3 flex shrink-0 flex-col gap-1">
              <span className="text-sm font-semibold text-white">Environment</span>
              <p className="text-xs text-white/60">
                Music and background always come as a pair.
              </p>
            </div>
            <EnvironmentCard
              env={env}
              onBrowse={() => setBrowseOpen(true)}
              className="min-h-[90px] max-h-[220px] w-full flex-1"
            />
          </div>

          <div className="mt-5 flex shrink-0 flex-col gap-3">
            <StartButton onClick={handleStart} />
          </div>
        </motion.div>
      </div>

      <EnvironmentBrowseSheet
        open={browseOpen}
        onOpenChange={setBrowseOpen}
        value={environmentId}
        onChange={setEnvironmentId}
      />
    </div>
  );
}

/**
 * The environment as a full-bleed preview card. The whole card opens the
 * browse sheet, and a dedicated 40px corner button offers the same action —
 * music and background always come as a pair, so one card represents both.
 * `layout` lets the preview animate its height when the Duration section
 * appears/disappears and the elastic region resizes it.
 */
function EnvironmentCard({
  env,
  onBrowse,
  className,
}: {
  env: Environment;
  onBrowse: () => void;
  className?: string;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl ring-1 ring-white/10 ring-inset",
        className,
      )}
    >
      <EnvironmentThumb env={env} className="absolute inset-0 h-full w-full" />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-white">{env.name}</span>
          <span className="truncate text-xs text-white/68">{env.description}</span>
        </span>
      </span>
      <button
        type="button"
        onClick={onBrowse}
        aria-label={`Choose environment: ${env.name}`}
        className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-accent-orange/60 focus-visible:ring-inset"
      />
      <button
        type="button"
        onClick={onBrowse}
        aria-label="Browse all environments"
        className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-90 backdrop-blur-md transition-colors outline-none hover:bg-white/25 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-accent-orange/60"
      >
        <LayoutGridIcon className="size-[18px]" />
      </button>
    </motion.div>
  );
}

/** Primary CTA: starts the session (kicks off audio inside the gesture). */
function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="lg"
      className="group/start h-14 w-full rounded-full bg-accent-orange px-3 text-base font-bold text-accent-orange-foreground shadow-[0_8px_24px_rgba(244,169,79,0.3)] hover:bg-accent-orange-hover hover:shadow-[0_8px_28px_rgba(244,169,79,0.4)] active:translate-y-0 active:scale-[0.98]"
      onClick={onClick}
    >
      <span className="flex-1 text-center">Start Focus</span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-105 group-active/start:scale-95">
        <PlayIcon className="size-4 fill-current" />
      </span>
    </Button>
  );
}
