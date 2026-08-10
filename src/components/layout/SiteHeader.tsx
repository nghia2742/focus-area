"use client";

import { useState } from "react";
import Link from "next/link";
import { HistoryDialog } from "@/components/history/HistoryDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  /** Floating over the immersive focus screen instead of in normal flow. */
  overlay?: boolean;
}

export function SiteHeader({ overlay = false }: SiteHeaderProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header
      className={cn(
        "z-40 flex w-full items-center justify-between border-b border-white/10 bg-[rgba(10,8,6,0.55)] px-4 backdrop-blur-xl sm:px-6",
        overlay ? "absolute inset-x-0 top-0" : "sticky top-0",
      )}
    >
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

      <nav className="flex items-center gap-1" aria-label="Primary">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => setHistoryOpen(true)}
        >
          History
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </Button>
      </nav>

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
