"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { FocusSetupSheet } from "@/components/focus/FocusSetupSheet";
import { ZenFade } from "@/components/home/ZenFade";
import { useHotkey } from "@/hooks/useHotkey";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

const SHORTCUTS = [
  { key: "F", label: "Focus" },
  { key: "S", label: "Settings" },
  { key: "H", label: "History" },
  { key: "Z", label: "Zen" },
] as const;

/**
 * The home-screen setup chrome when no session is active: the bottom-center
 * Focus CTA pill that opens the Focus Setup sheet, with a keyboard-shortcut
 * legend above it. It fades with Zen Mode. The sheet itself is not wrapped, so
 * it keeps full opacity when open.
 */
export function SetupLayer() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useHotkey("f", () => setSheetOpen(true));

  useEffect(() => {
    if (wasOpenRef.current && !sheetOpen) {
      ctaRef.current?.focus();
    }
    wasOpenRef.current = sheetOpen;
  }, [sheetOpen]);

  return (
    <>
      <ZenFade>
        <div className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">
          <div className="hidden items-center gap-4 text-xs text-artwork-ink-muted sm:flex">
            {SHORTCUTS.map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5">
                <Kbd className="bg-artwork-veil text-artwork-ink">{key}</Kbd>
                {label}
              </span>
            ))}
          </div>
          <FocusCta ref={ctaRef} onOpen={() => setSheetOpen(true)} />
        </div>
      </ZenFade>
      <FocusSetupSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

interface FocusCtaProps {
  onOpen: () => void;
}

/**
 * Start Focus CTA — the one solid-accent element on the idle screen, so it
 * reads as the primary action. Labelled (not icon-only) so a first-time user
 * knows what it does without hovering.
 */
function FocusCta({ ref, onOpen }: FocusCtaProps & { ref: React.Ref<HTMLButtonElement> }) {
  return (
    <Button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label="Start a focus session"
      size="xl"
      className="rounded-full px-6"
    >
      <PlayIcon data-icon="inline-start" />
      Start focus
    </Button>
  );
}
