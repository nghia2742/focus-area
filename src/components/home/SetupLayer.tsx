"use client";

import { useEffect, useRef, useState } from "react";
import { ClockIcon } from "lucide-react";
import { FocusSetupSheet } from "@/components/focus/FocusSetupSheet";
import { ZenFade } from "@/components/home/ZenFade";
import { IdleCenterContent } from "@/components/home/IdleCenterContent";
import { Button } from "@/components/ui/button";

/**
 * The home-screen setup chrome when no session is active: the round Focus
 * CTA (center-bottom) that opens the Focus Setup sheet, plus the idle greeting
 * above it. Both fade with Zen Mode (the greeting keeps its own 0.55 base so
 * opacity never stacks). The sheet itself is not wrapped, so it keeps full
 * opacity when open.
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
      <IdleCenterContent />
      <FocusSetupSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

interface FocusCtaProps {
  onOpen: () => void;
}

/**
 * Round Start Focus CTA — the one solid-accent element on the idle screen, so
 * it reads as the primary action.
 */
function FocusCta({ ref, onOpen }: FocusCtaProps & { ref: React.Ref<HTMLButtonElement> }) {
  return (
    <Button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label="Start a focus session"
      className="fixed bottom-8 left-1/2 z-30 size-16 -translate-x-1/2 rounded-full shadow-lg"
    >
      <ClockIcon className="size-7" />
    </Button>
  );
}
