"use client";

import Link from "next/link";
import { useState } from "react";
import { HistoryIcon, SettingsIcon } from "lucide-react";
import { HistoryDialog } from "@/components/history/HistoryDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";

/**
 * Transparent navbar with two zones: Logo on the left, History + Settings on
 * the right. No background, no border, no shadow — it floats over the artwork.
 * History and Settings open dialogs; the rail's buttons live elsewhere.
 */
export function SiteHeader() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="group flex items-center gap-2.5 rounded-full py-2 pr-2 pl-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Focus home"
      >
        <span className="relative flex size-6 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent-vivid/20 blur-[3px] transition-opacity group-hover:opacity-80" />
          <span className="relative size-2.5 rounded-full bg-accent-vivid" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-white">Focus</span>
      </Link>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          aria-label="Open focus history"
          className="group inline-flex items-center gap-1.5 rounded-full py-2 pr-2 pl-1 text-sm font-medium text-white/80 outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HistoryIcon className="size-4 text-white/55 transition-colors group-hover:text-white/85" />
          History
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="group inline-flex items-center gap-1.5 rounded-full py-2 pr-2 pl-1 text-sm font-medium text-white/80 outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SettingsIcon className="size-4 text-white/55 transition-colors group-hover:text-white/85" />
          Settings
        </button>
      </div>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
