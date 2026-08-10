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
        "z-40 flex w-full justify-center px-4",
        overlay
          ? "absolute inset-x-0 top-4"
          : "sticky top-4",
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full py-1.5 pr-1.5 pl-3",
          overlay
            ? "glass"
            : "glass border-white/10 bg-background/70 shadow-[0_8px_32px_-12px_oklch(0.19_0.03_55/0.25)]",
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Focus home"
        >
          <span className="relative flex size-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent-vivid/20 blur-[3px] transition-opacity group-hover:opacity-80" />
            <span className="relative size-2.5 rounded-full bg-accent-vivid" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Focus</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setHistoryOpen(true)}
          >
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
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
