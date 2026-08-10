"use client";

import { useState } from "react";
import Link from "next/link";
import { HistoryDialog } from "@/components/history/HistoryDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg px-1.5 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="relative flex size-5 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent-vivid opacity-25 transition-opacity group-hover:opacity-40" />
            <span className="size-2.5 rounded-full bg-accent-vivid" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Focus</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(true)}
          >
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
        </nav>
      </div>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
