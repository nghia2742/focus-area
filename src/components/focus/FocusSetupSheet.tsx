"use client";

import { useRef, useState } from "react";
import { BellIcon, PlayIcon, RepeatIcon, TimerIcon, TimerOffIcon } from "lucide-react";
import { toast } from "sonner";
import type { FocusMode } from "@/types/focus";
import { MAX_COMPLETION_MESSAGE_LENGTH } from "@/types/focus";
import { ENVIRONMENTS, getEnvironment } from "@/data/environments";
import { useSettingsStore } from "@/store/settingsStore";
import { useFocusStore } from "@/store/focusStore";
import type { PomodoroConfig } from "@/features/pomodoro/types";
import { usePomodoroConfigStore } from "@/features/pomodoro/store";
import { PomodoroSettings } from "@/features/pomodoro/PomodoroSettings";
import {
  previewCompletionNotification,
  requestNotificationPermission,
} from "@/lib/notifications";
import {
  DurationField,
  type DurationFieldHandle,
} from "@/components/shared/DurationField";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FocusSetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Bottom sheet triggered by the Focus CTA: Task (optional) + Mode (Open /
 * Target / Pomodoro) + Duration (Target) or Pomodoro settings + Start. The
 * environment pair is applied silently from settings — there is no picker here.
 */
export function FocusSetupSheet({ open, onOpenChange }: FocusSetupSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[86dvh] w-full gap-0 rounded-t-3xl border-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="gap-1 px-6 pt-6 pb-4 pr-14">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            What are you working on?
          </SheetTitle>
          <SheetDescription>
            Set an intention, then disappear into it.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-6 pb-8">
          <SheetForm onStart={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Gates the form on hydration so it mounts with persisted defaults. */
function SheetForm({ onStart }: { onStart: () => void }) {
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const pomodoroHydrated = usePomodoroConfigStore((s) => s.hydrated);
  if (!settingsHydrated || !pomodoroHydrated) return <SheetSkeleton />;
  return <SheetFormInner onStart={onStart} />;
}

function SheetFormInner({ onStart }: { onStart: () => void }) {
  const { settings, update } = useSettingsStore();
  const { config: pomodoroDefaults, update: updatePomodoro } = usePomodoroConfigStore();
  const startSession = useFocusStore((s) => s.start);

  const [taskName, setTaskName] = useState("");
  const [mode, setMode] = useState<FocusMode>(settings.defaultMode);
  const [pomodoro, setPomodoro] = useState<PomodoroConfig>(pomodoroDefaults);
  const [targetDuration, setTargetDuration] = useState(() => {
    const minutes = settings.defaultDuration;
    return Number.isInteger(minutes) && minutes >= 1 && minutes <= 600 ? minutes : 50;
  });
  const [finishMessage, setFinishMessage] = useState(
    () => settings.completionMessage ?? "",
  );
  const durationRef = useRef<DurationFieldHandle>(null);

  /** Asks for permission (if needed) and shows the finish notification. */
  const handlePreviewMessage = async () => {
    const result = await previewCompletionNotification(
      targetDuration,
      finishMessage,
    );
    if (result === "granted") {
      toast.success("Preview sent — check your notifications.");
    } else if (result === "denied") {
      toast.error("Notifications are blocked. Allow them in your browser settings.");
    } else if (result === "unsupported") {
      toast.error("This browser doesn't support notifications.");
    } else {
      toast("Notification permission was not granted.");
    }
  };

  const handleStart = (minutes = targetDuration) => {
    let target: number | undefined;
    let completionMessage: string | undefined;
    if (mode === "target") {
      const resolved = durationRef.current
        ? durationRef.current.validate()
        : minutes;
      if (resolved == null) return;
      target = resolved;
      completionMessage = finishMessage.trim() || undefined;
    }

    // No environment picker in setup — apply the remembered pair, else default.
    const environmentId =
      settings.rememberLastEnvironment && settings.lastEnvironmentId
        ? settings.lastEnvironmentId
        : ENVIRONMENTS[0].id;
    const environment = getEnvironment(environmentId) ?? ENVIRONMENTS[0];

    startSession({
      taskName,
      mode,
      targetDuration: target,
      completionMessage,
      musicId: environment.musicId,
      backgroundId: environment.backgroundId,
      pomodoro: mode === "pomodoro" ? pomodoro : undefined,
    });

    if (mode === "target") update({ completionMessage: completionMessage ?? "" });
    if (mode === "pomodoro") updatePomodoro(pomodoro);
    if (settings.rememberLastEnvironment) update({ lastEnvironmentId: environment.id });

    requestNotificationPermission();
    onStart();
  };

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="task-name">
            Task <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Input
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. Learn PostgreSQL"
            autoComplete="off"
            autoFocus
          />
        </Field>

        <Field>
          <FieldLabel>Mode</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            aria-label="Focus mode"
            value={mode}
            onValueChange={(v) => {
              if (v) setMode(v as FocusMode);
            }}
            className="w-full"
          >
            <ToggleGroupItem value="open" className="flex-1">
              <TimerOffIcon data-icon="inline-start" />
              Open
            </ToggleGroupItem>
            <ToggleGroupItem value="target" className="flex-1">
              <TimerIcon data-icon="inline-start" />
              Target
            </ToggleGroupItem>
            <ToggleGroupItem value="pomodoro" className="flex-1">
              <RepeatIcon data-icon="inline-start" />
              Pomodoro
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        {mode === "pomodoro" && (
          <PomodoroSettings config={pomodoro} onChange={setPomodoro} />
        )}

        {mode === "target" && (
          <>
            <DurationField
              ref={durationRef}
              label="Duration"
              value={targetDuration}
              onChange={setTargetDuration}
              onSubmit={handleStart}
            />

            <Field>
              <FieldLabel htmlFor="completion-message">
                Finish message <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="completion-message"
                  value={finishMessage}
                  maxLength={MAX_COMPLETION_MESSAGE_LENGTH}
                  onChange={(e) =>
                    setFinishMessage(
                      e.target.value.slice(0, MAX_COMPLETION_MESSAGE_LENGTH),
                    )
                  }
                  placeholder="e.g. Stand up, stretch, drink water"
                  autoComplete="off"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Preview the finish notification"
                      onClick={handlePreviewMessage}
                    >
                      <BellIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview notification</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <FieldDescription>
                  Shown when the timer reaches zero. Leave empty for the default.
                </FieldDescription>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {finishMessage.length}/{MAX_COMPLETION_MESSAGE_LENGTH}
                </span>
              </div>
            </Field>
          </>
        )}
      </FieldGroup>

      <Button size="xl" className="w-full" onClick={() => handleStart()}>
        Start Focus
        <PlayIcon data-icon="inline-end" />
      </Button>
    </div>
  );
}

function SheetSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
