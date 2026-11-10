"use client";

import Link from "next/link";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, HistoryIcon, SettingsIcon } from "lucide-react";
import { HistoryDialog } from "@/features/history/HistoryDialog";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { useSettingsStore } from "@/store/settingsStore";
import { useHotkey } from "@/hooks/useHotkey";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Transparent navbar with two zones: logo on the left, a ButtonGroup of icon
 * buttons on the right (Zen Mode, History, Settings — each with a hover
 * tooltip). No bar chrome — it floats over the room artwork.
 */
export function SiteHeader() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const zenMode = useSettingsStore((s) => s.zenMode);
  const setZenMode = useSettingsStore((s) => s.setZenMode);

  // Global chrome shortcuts stay alive while an overlay is open (the fade and
  // the "Welcome back." dialog both sit in front of the running session), and
  // S / H swap the two dialogs instead of stacking them.
  useHotkey(
    "h",
    () => {
      setSettingsOpen(false);
      setHistoryOpen(true);
    },
    { allowInOverlay: true },
  );
  useHotkey(
    "s",
    () => {
      setHistoryOpen(false);
      setSettingsOpen(true);
    },
    { allowInOverlay: true },
  );
  useHotkey("z", () => setZenMode(!zenMode), { allowInOverlay: true });

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="flex min-h-11 items-center gap-2.5 rounded-full px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Focus home"
      >
        <span className="size-2.5 rounded-full bg-primary" aria-hidden />
        <span className="text-sm font-semibold tracking-tight text-artwork-ink">
          Focus
        </span>
      </Link>

      <ButtonGroup aria-label="App actions">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open focus history"
            >
              <HistoryIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            History <Kbd>H</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              <SettingsIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Settings <Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink aria-pressed:bg-artwork-line aria-pressed:text-artwork-ink"
              aria-pressed={zenMode}
              aria-label={zenMode ? "Turn Zen Mode off" : "Turn Zen Mode on"}
              onClick={() => setZenMode(!zenMode)}
            >
              {zenMode ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Zen Mode — fade the interface</span> <Kbd>Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <span className="sr-only" aria-live="polite">
        {zenMode ? "Zen Mode is on — interface faded" : ""}
      </span>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
