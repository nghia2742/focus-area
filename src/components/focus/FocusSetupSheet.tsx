"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlayIcon, TimerIcon, TimerOffIcon } from "lucide-react";
import type { FocusMode } from "@/types/focus";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusStore } from "@/store/focusStore";
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

/** Dark-surface styling shared by text/number inputs on the glass sheet. */
const darkInput =
  "h-11 rounded-full border-white/12 bg-white/6 px-5 text-base text-white placeholder:text-white/40 shadow-none focus-visible:border-accent-orange focus-visible:ring-3 focus-visible:ring-accent-orange/30 focus-visible:bg-white/9 md:text-base";

interface FocusSetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Bottom sheet triggered by the round Focus CTA. Holds the session setup —
 * Task (optional) + Mode (Open / Target Focus) + Duration + Start. The
 * Environment picker was removed from setup; the remembered/default pair is
 * applied silently. Slides up 300ms easeOut, slides down 300ms easeIn.
 */
export function FocusSetupSheet({ open, onOpenChange }: FocusSetupSheetProps) {
  return (
    <AnimatePresence>
      {open && <SheetPanel onClose={() => onOpenChange(false)} />}
    </AnimatePresence>
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function SheetPanel({ onClose }: { onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const backdropTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeOut" as const };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial="closed"
      animate="open"
      exit="closed"
    >
      <motion.button
        type="button"
        aria-label="Close focus setup"
        tabIndex={-1}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        variants={{
          open: { opacity: 1, transition: backdropTransition },
          closed: { opacity: 0, transition: { ...backdropTransition, ease: "easeIn" } },
        }}
        initial="closed"
        animate="open"
        exit="closed"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[80dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-[rgba(20,16,14,0.94)] shadow-[0_-24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        variants={{
          open: { y: "0%", transition: panelTransition },
          closed: { y: "100%", transition: { ...panelTransition, ease: "easeIn" } },
        }}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5 overflow-y-auto px-6 pt-2 pb-6 sm:px-8">
          <div
            className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-white/20"
            aria-hidden
          />
          <div className="flex shrink-0 flex-col gap-1">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-white">
              What are you working on?
            </h2>
            <p className="text-sm text-white/75">
              Set an intention, then disappear into it.
            </p>
          </div>

          <SheetForm onStart={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Gates the form on hydration so it mounts with persisted defaults. */
function SheetForm({ onStart }: { onStart: () => void }) {
  const hydrated = useSettingsStore((s) => s.hydrated);
  if (!hydrated) return <SheetSkeleton />;
  return <SheetFormInner onStart={onStart} />;
}

function SheetFormInner({ onStart }: { onStart: () => void }) {
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
  const taskRef = useRef<HTMLInputElement>(null);
  const customDurationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    taskRef.current?.focus();
  }, []);

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
        if (durationChoice === "custom") {
          customDurationRef.current?.focus();
        }
        return;
      }
      targetDuration = d;
    }

    // No environment picker in setup — apply the remembered pair, else default.
    const environmentId =
      settings.rememberLastEnvironment && settings.lastEnvironmentId
        ? settings.lastEnvironmentId
        : ENVIRONMENTS[0].id;
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

    if (taskName.trim()) update({ lastTaskName: taskName.trim() });
    if (settings.rememberLastEnvironment) update({ lastEnvironmentId: environment.id });

    requestNotificationPermission();
    onStart();
  };

  const customInvalid =
    durationChoice === "custom" && mode === "target" && resolvedDuration() == null;

  return (
    <div className="flex shrink-0 flex-col gap-5">
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="task-name" className="text-white">
            Task (optional)
          </FieldLabel>
          <Input
            ref={taskRef}
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
            aria-label="Focus mode"
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
            <div className="flex flex-col gap-3 pt-1">
              <span className="text-sm font-semibold text-white">Duration</span>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                  type="single"
                  aria-label="Target duration presets"
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
                    ref={customDurationRef}
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

      <StartButton onClick={handleStart} />
    </div>
  );
}

function SheetSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
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
