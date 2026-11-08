"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { FocusSetupSheet } from "@/components/focus/FocusSetupSheet";
import { ZenFade } from "@/components/home/ZenFade";
import { Button } from "@/components/ui/button";

/**
 * The home-screen setup chrome when no session is active: the bottom-center
 * Focus CTA pill that opens the Focus Setup sheet. It fades with Zen Mode. The
 * sheet itself is not wrapped, so it keeps full opacity when open.
 */
export function SetupLayer() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (wasOpenRef.current && !sheetOpen) {
      ctaRef.current?.focus();
    }
    wasOpenRef.current = sheetOpen;
  }, [sheetOpen]);

  return (
    <>
      <ZenFade>
        <FocusCta ref={ctaRef} onOpen={() => setSheetOpen(true)} />
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
      className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full px-6"
    >
      <PlayIcon data-icon="inline-start" />
      Start focus
    </Button>
  );
}
