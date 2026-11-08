"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FOCUS_DURATION_PRESETS } from "@/types/focus";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ERROR_MESSAGE = "Enter a duration between 1 and 600 minutes.";

function isPreset(value: number): boolean {
  return FOCUS_DURATION_PRESETS.includes(value);
}

export interface DurationFieldHandle {
  /** Current minutes, or null (and shows the error) when the custom value is invalid. */
  validate: () => number | null;
}

interface DurationFieldProps {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  /** Fired when Enter is pressed with a valid custom value. */
  onSubmit?: (minutes: number) => void;
}

/**
 * Duration picker shared by the setup sheet and Settings: three presets plus a
 * Custom option that swaps into an inline numeric input of the same width.
 */
export const DurationField = forwardRef<DurationFieldHandle, DurationFieldProps>(
  function DurationField({ label, value, onChange, onSubmit }, ref) {
    const [customSelected, setCustomSelected] = useState(() => !isPreset(value));
    const [customValue, setCustomValue] = useState(() =>
      isPreset(value) ? "" : String(value),
    );
    const [error, setError] = useState<string | null>(null);
    const lastValue = useRef(value);

    // Follow external changes (preset click, reset, saved default) without
    // discarding the text the user is currently typing.
    useEffect(() => {
      if (lastValue.current === value) return;
      lastValue.current = value;
      setError(null);
      if (isPreset(value)) {
        setCustomSelected(false);
        setCustomValue("");
      } else {
        setCustomSelected(true);
        setCustomValue(String(value));
      }
    }, [value]);

    const resolve = useCallback((): number | null => {
      if (!customSelected) return value;
      const minutes = Number(customValue);
      if (
        customValue.trim() === "" ||
        !Number.isInteger(minutes) ||
        minutes < 1 ||
        minutes > 600
      ) {
        setError(ERROR_MESSAGE);
        return null;
      }
      setError(null);
      return minutes;
    }, [customSelected, customValue, value]);

    useImperativeHandle(ref, () => ({ validate: resolve }), [resolve]);

    const selectPreset = (minutes: number) => {
      setCustomSelected(false);
      setCustomValue("");
      setError(null);
      onChange(minutes);
    };

    return (
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel>{label}</FieldLabel>
        <ToggleGroup
          type="single"
          aria-label={label}
          value={customSelected ? "" : String(value)}
          onValueChange={(next) => {
            if (!next) return;
            if (next === "custom") {
              setCustomSelected(true);
              setCustomValue("");
              setError(null);
              return;
            }
            selectPreset(Number(next));
          }}
          variant="outline"
          className="grid w-full grid-cols-[repeat(3,minmax(0,1fr))_8rem] gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))_10rem]"
        >
          {FOCUS_DURATION_PRESETS.map((minutes) => (
            <ToggleGroupItem key={minutes} value={String(minutes)}>
              {minutes}m
            </ToggleGroupItem>
          ))}
          {customSelected ? (
            <Input
              type="number"
              min={1}
              max={600}
              inputMode="numeric"
              aria-label="Custom duration in minutes"
              aria-invalid={error ? true : undefined}
              placeholder="1-600m"
              value={customValue}
              autoFocus
              onChange={(event) => {
                setCustomValue(event.target.value);
                setError(null);
              }}
              onBlur={() => {
                const minutes = resolve();
                if (minutes != null) onChange(minutes);
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key !== "Enter") return;
                const minutes = resolve();
                if (minutes == null) return;
                onChange(minutes);
                onSubmit?.(minutes);
              }}
              className="w-full text-center font-tabular"
            />
          ) : (
            <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
          )}
        </ToggleGroup>
        <FieldError>{error}</FieldError>
      </Field>
    );
  },
);
