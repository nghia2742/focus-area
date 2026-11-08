"use client";

import { useState } from "react";
import { PaletteIcon, Settings2Icon } from "lucide-react";
import { useAppearanceStore } from "@/store/appearanceStore";
import { useSettingsStore } from "@/store/settingsStore";
import { usePomodoroConfigStore } from "@/features/pomodoro/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AppearanceSettings } from "./AppearanceSettings";
import { GeneralSettings } from "./GeneralSettings";

type SettingsSection = "appearance" | "general";

const SECTIONS: {
  value: SettingsSection;
  label: string;
  icon: typeof PaletteIcon;
}[] = [
  { value: "appearance", label: "Appearance", icon: PaletteIcon },
  { value: "general", label: "General", icon: Settings2Icon },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [section, setSection] = useState<SettingsSection>("appearance");
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const appearanceHydrated = useAppearanceStore((s) => s.hydrated);
  const pomodoroHydrated = usePomodoroConfigStore((s) => s.hydrated);
  const hydrated = settingsHydrated && appearanceHydrated && pomodoroHydrated;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85dvh,42rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] sm:grid-rows-1">
          <nav className="border-b p-3 sm:border-r sm:border-b-0">
            <ToggleGroup
              type="single"
              aria-label="Settings sections"
              value={section}
              onValueChange={(value) => {
                if (value === "appearance" || value === "general") setSection(value);
              }}
              className="w-full gap-1 sm:flex-col"
            >
              {SECTIONS.map((item) => (
                <ToggleGroupItem
                  key={item.value}
                  value={item.value}
                  className="h-9 flex-1 gap-2 px-3 sm:w-full sm:flex-none sm:justify-start"
                >
                  <item.icon data-icon="inline-start" />
                  <span className="sr-only sm:not-sr-only">{item.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </nav>

          <div className="min-h-0 overflow-y-auto p-5">
            {!hydrated ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : section === "appearance" ? (
              <AppearanceSettings />
            ) : (
              <GeneralSettings />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
