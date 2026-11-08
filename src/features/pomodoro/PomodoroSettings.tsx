"use client";

import { LIMITS, PRESETS, clampConfig } from "./config";
import type { PomodoroConfig } from "./types";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PomodoroSettingsProps {
  config: PomodoroConfig;
  onChange: (config: PomodoroConfig) => void;
}

/** Pomodoro config form shared by the setup sheet and Settings. */
export function PomodoroSettings({ config, onChange }: PomodoroSettingsProps) {
  const set = (partial: Partial<PomodoroConfig>) =>
    onChange(clampConfig({ ...config, ...partial }));

  const activePreset =
    PRESETS.find(
      (preset) =>
        preset.focusMin === config.focusMin &&
        preset.shortBreakMin === config.shortBreakMin &&
        preset.longBreakMin === config.longBreakMin,
    )?.id ?? "";

  return (
    <FieldGroup className="gap-4">
      <h3 className="font-heading text-sm font-medium">Pomodoro cycle</h3>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Pomodoro presets"
        value={activePreset}
        onValueChange={(value) => {
          const preset = PRESETS.find((item) => item.id === value);
          if (preset) set(preset);
        }}
        className="w-full"
      >
        {PRESETS.map((preset) => (
          <ToggleGroupItem key={preset.id} value={preset.id} className="flex-1">
            {preset.id}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="pomodoro-focus"
          label="Focus (min)"
          value={config.focusMin}
          min={LIMITS.focusMin.min}
          max={LIMITS.focusMin.max}
          onChange={(focusMin) => set({ focusMin })}
        />
        <NumberField
          id="pomodoro-short-break"
          label="Short break (min)"
          value={config.shortBreakMin}
          min={LIMITS.shortBreakMin.min}
          max={LIMITS.shortBreakMin.max}
          onChange={(shortBreakMin) => set({ shortBreakMin })}
        />
        <NumberField
          id="pomodoro-long-break"
          label="Long break (min)"
          value={config.longBreakMin}
          min={LIMITS.longBreakMin.min}
          max={LIMITS.longBreakMin.max}
          onChange={(longBreakMin) => set({ longBreakMin })}
        />
        <NumberField
          id="pomodoro-rounds-per-long-break"
          label="Rounds per long break"
          value={config.roundsPerLongBreak}
          min={LIMITS.roundsPerLongBreak.min}
          max={LIMITS.roundsPerLongBreak.max}
          onChange={(roundsPerLongBreak) => set({ roundsPerLongBreak })}
        />
        <NumberField
          id="pomodoro-total-rounds"
          label="Total rounds"
          value={config.totalRounds}
          min={LIMITS.totalRounds.min}
          max={LIMITS.totalRounds.max}
          onChange={(totalRounds) => set({ totalRounds })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Field orientation="horizontal">
          <FieldLabel htmlFor="pomodoro-auto-break">Auto-start breaks</FieldLabel>
          <Switch
            id="pomodoro-auto-break"
            aria-label="Auto-start breaks"
            checked={config.autoStartBreak}
            onCheckedChange={(autoStartBreak) => set({ autoStartBreak })}
          />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="pomodoro-auto-focus">Auto-start next focus</FieldLabel>
          <Switch
            id="pomodoro-auto-focus"
            aria-label="Auto-start next focus"
            checked={config.autoStartFocus}
            onCheckedChange={(autoStartFocus) => set({ autoStartFocus })}
          />
        </Field>
      </div>

      <p className="text-sm text-muted-foreground">
        {config.totalRounds} rounds · {config.totalRounds * config.focusMin} min focus total
      </p>
    </FieldGroup>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberField({ id, label, value, min, max, onChange }: NumberFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="font-tabular"
      />
    </Field>
  );
}
