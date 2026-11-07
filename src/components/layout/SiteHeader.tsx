"use client";

import Link from "next/link";
import { useState } from "react";
import { HistoryIcon, SettingsIcon } from "lucide-react";
import { HistoryDialog } from "@/components/history/HistoryDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";

/**
 * Transparent navbar with two zones: logo on the left, History + Settings on
 * the right. No bar chrome — it floats over the room artwork.
 */
export function SiteHeader() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="min-h-11 px-3 text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink"
          onClick={() => setHistoryOpen(true)}
          aria-label="Open focus history"
        >
          <HistoryIcon data-icon="inline-start" />
          History
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 px-3 text-artwork-ink hover:bg-artwork-line hover:text-artwork-ink"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          <SettingsIcon data-icon="inline-start" />
          Settings
        </Button>
      </div>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
