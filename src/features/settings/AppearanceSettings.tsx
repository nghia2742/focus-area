"use client";

import { useTheme } from "next-themes";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppearance } from "@/components/providers/AppearanceProvider";
import {
  APPEARANCE_STYLES,
  BASE_COLORS,
  BASE_COLOR_LABELS,
  COLOR_MODES,
  isAppearanceStyle,
  isBaseColor,
  isColorMode,
  isPaletteColor,
  PALETTE_COLORS,
  PALETTE_LABELS,
  STYLE_LABELS,
} from "@/lib/appearance/presets";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const COLOR_MODE_OPTIONS = {
  dark: { label: "Dark", icon: MoonIcon },
  light: { label: "Light", icon: SunIcon },
  system: { label: "System", icon: MonitorIcon },
} as const;

const PREVIEW_ITEM =
  "h-auto w-full flex-col items-stretch gap-1.5 p-2 data-[state=on]:ring-2 data-[state=on]:ring-ring";

export function AppearanceSettings() {
  const {
    appearance,
    setColorMode,
    setStyle,
    setBaseColor,
    setTheme,
    setChartColor,
    resetAppearance,
  } = useAppearance();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-base font-medium">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize how Focus looks. Every change applies immediately.
        </p>
      </header>

      <Field>
        <FieldLabel>Color mode</FieldLabel>
        <FieldDescription>Follow your system or lock a mode.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Color mode"
          variant="outline"
          value={appearance.colorMode}
          onValueChange={(value) => {
            if (isColorMode(value)) setColorMode(value);
          }}
          className="w-full"
        >
          {COLOR_MODES.map((mode) => {
            const option = COLOR_MODE_OPTIONS[mode];
            return (
              <ToggleGroupItem key={mode} value={mode} className="flex-1 gap-2">
                <option.icon data-icon="inline-start" />
                {option.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </Field>

      <Separator />

      <Field>
        <FieldLabel>Style</FieldLabel>
        <FieldDescription>Component shape and corner radius.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Style"
          value={appearance.style}
          onValueChange={(value) => {
            if (isAppearanceStyle(value)) setStyle(value);
          }}
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {APPEARANCE_STYLES.map((style) => (
            <ToggleGroupItem
              key={style}
              value={style}
              aria-label={STYLE_LABELS[style]}
              className={PREVIEW_ITEM}
            >
              <div
                data-style={style}
                className="flex h-14 w-full flex-col gap-1.5 rounded-md border border-border bg-background p-2"
              >
                <span className="h-2 w-1/2 rounded-sm bg-primary" />
                <span className="h-1.5 w-3/4 rounded-sm bg-muted-foreground/40" />
                <span className="mt-auto h-2.5 w-1/3 rounded-sm bg-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">{STYLE_LABELS[style]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Separator />

      <Field>
        <FieldLabel>Base color</FieldLabel>
        <FieldDescription>Neutral surfaces, borders and text.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Base color"
          value={appearance.baseColor}
          onValueChange={(value) => {
            if (isBaseColor(value)) setBaseColor(value);
          }}
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {BASE_COLORS.map((color) => (
            <ToggleGroupItem
              key={color}
              value={color}
              aria-label={BASE_COLOR_LABELS[color]}
              className={PREVIEW_ITEM}
            >
              <div
                data-base-color={color}
                className={cn(
                  "flex h-10 w-full items-center gap-1.5 rounded-md border border-border bg-background px-2",
                  isDark && "dark",
                )}
              >
                <span className="size-3 rounded-full bg-foreground" />
                <span className="h-1.5 flex-1 rounded-full bg-muted-foreground/60" />
                <span className="size-3 rounded-full border border-border bg-card" />
              </div>
              <span className="text-xs text-muted-foreground">{BASE_COLOR_LABELS[color]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Separator />

      <Field>
        <FieldLabel>Theme</FieldLabel>
        <FieldDescription>Primary accent for actions and focus states.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Theme"
          value={appearance.theme}
          onValueChange={(value) => {
            if (isPaletteColor(value)) setTheme(value);
          }}
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {PALETTE_COLORS.map((color) => (
            <ToggleGroupItem
              key={color}
              value={color}
              aria-label={PALETTE_LABELS[color]}
              className={PREVIEW_ITEM}
            >
              <div
                data-theme-color={color}
                className={cn(
                  "flex h-10 w-full items-center gap-1.5 rounded-md border border-border bg-background px-2",
                  isDark && "dark",
                )}
              >
                <span className="size-4 rounded-full bg-primary" />
                <span className="h-2 flex-1 rounded-full bg-primary/25" />
              </div>
              <span className="text-xs text-muted-foreground">{PALETTE_LABELS[color]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Separator />

      <Field>
        <FieldLabel>Chart color</FieldLabel>
        <FieldDescription>Palette used by history charts.</FieldDescription>
        <ToggleGroup
          type="single"
          aria-label="Chart color"
          value={appearance.chartColor}
          onValueChange={(value) => {
            if (isPaletteColor(value)) setChartColor(value);
          }}
          className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {PALETTE_COLORS.map((color) => (
            <ToggleGroupItem
              key={color}
              value={color}
              aria-label={PALETTE_LABELS[color]}
              className={PREVIEW_ITEM}
            >
              <div
                data-chart-color={color}
                className="flex h-10 w-full items-end gap-1 rounded-md border border-border bg-background p-1.5"
              >
                <span className="h-1.5 flex-1 rounded-sm bg-chart-1" />
                <span className="h-2 flex-1 rounded-sm bg-chart-2" />
                <span className="h-2.5 flex-1 rounded-sm bg-chart-3" />
                <span className="h-3 flex-1 rounded-sm bg-chart-4" />
                <span className="h-3.5 flex-1 rounded-sm bg-chart-5" />
              </div>
              <span className="text-xs text-muted-foreground">{PALETTE_LABELS[color]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Separator />

      <div className="flex flex-col items-start gap-1.5">
        <Button variant="outline" size="sm" onClick={resetAppearance}>
          Reset appearance
        </Button>
        <p className="text-xs text-muted-foreground">
          Restores color mode, style, base color, theme and chart color.
        </p>
      </div>
    </div>
  );
}
