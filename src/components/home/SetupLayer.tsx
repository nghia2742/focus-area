"use client";

import { useEffect, useRef, useState } from "react";
import { ClockIcon } from "lucide-react";
import { FocusSetupSheet } from "@/components/focus/FocusSetupSheet";
import { ZenFade } from "@/components/home/ZenFade";
import { IdleCenterContent } from "@/components/home/IdleCenterContent";

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
 * Round Start Focus CTA — the one solid-accent element, deliberately distinct
 * from the flat rail so it reads as the primary action.
 */
function FocusCta({ ref, onOpen }: FocusCtaProps & { ref: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label="Start a focus session"
      className="fixed bottom-8 left-1/2 z-30 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-accent-orange text-accent-orange-foreground shadow-[0_8px_24px_rgba(244,169,79,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] outline-none transition-[background-color,transform,box-shadow] duration-200 hover:scale-105 hover:bg-accent-orange-hover hover:shadow-[0_8px_28px_rgba(244,169,79,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-95 focus-visible:ring-3 focus-visible:ring-white/40"
    >
      <ClockIcon className="size-7" />
    </button>
  );
}
