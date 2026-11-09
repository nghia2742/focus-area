"use client";

import { useState } from "react";
import { BellOffIcon, VolumeXIcon } from "lucide-react";
import {
  ensureNotificationPermission,
  getNotificationPermission,
  type NotificationPreviewResult,
} from "@/lib/notifications";
import {
  isCompletionSoundBlocked,
  playCompletionSound,
  unlockCompletionSound,
} from "@/lib/audio/completionSound";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Help {
  title: string;
  steps?: string[];
}

const NOTIFICATION_HELP: Record<Exclude<NotificationPreviewResult, "granted">, Help> = {
  default: {
    title: "Notifications are off",
    steps: [
      "Click the bell — the browser asks for permission.",
      "Or open the lock icon in the address bar and allow it there.",
    ],
  },
  denied: {
    title: "Notifications are blocked",
    steps: [
      "Open the lock icon in the address bar.",
      "Allow notifications for this site, then start again.",
    ],
  },
  unsupported: { title: "This browser can't show notifications." },
};

const SOUND_HELP: Help = {
  title: "Sound is blocked",
  steps: [
    "Allow audio for this site in your browser.",
    "Then click the speaker to test it.",
  ],
};

function HelpContent({ title, steps }: Help) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-medium">{title}</p>
      {steps && (
        <ol className="flex list-decimal flex-col gap-0.5 pl-4">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Status icons after the setup-sheet title (nothing when alerts are ready).
 * A finish alert needs both the browser's notification permission and audio
 * playback, and neither is granted from a page load — so each blocked one gets
 * an icon: hover for the steps, click to ask again.
 */
export function AlertStatus() {
  const [permission, setPermission] = useState(getNotificationPermission);
  const [soundBlocked, setSoundBlocked] = useState(isCompletionSoundBlocked);

  if (permission === "granted" && !soundBlocked) return null;

  return (
    <span className="flex items-center gap-0.5">
      {permission !== "granted" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Notifications are not allowed"
              onClick={() => void ensureNotificationPermission().then(setPermission)}
            >
              <BellOffIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="block max-w-64">
            <HelpContent {...NOTIFICATION_HELP[permission]} />
          </TooltipContent>
        </Tooltip>
      )}

      {soundBlocked && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Sound is blocked"
              onClick={() =>
                void unlockCompletionSound().then((blocked) => {
                  setSoundBlocked(blocked);
                  if (!blocked) playCompletionSound();
                })
              }
            >
              <VolumeXIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="block max-w-64">
            <HelpContent {...SOUND_HELP} />
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
