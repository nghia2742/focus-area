"use client";

import { CheckIcon } from "lucide-react";
import { ENVIRONMENTS } from "@/data/environments";
import { EnvironmentThumb } from "@/components/media/EnvironmentThumb";
import { cn } from "@/lib/utils";

interface EnvironmentSelectorProps {
  value?: string;
  onChange: (id: string) => void;
  compact?: boolean;
}

/**
 * Lists the available atmospheres. Music and background are a pair, so
 * picking an environment applies both its audio track and its background.
 */
export function EnvironmentSelector({
  value,
  onChange,
  compact,
}: EnvironmentSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {ENVIRONMENTS.map((env) => {
        const selected = value === env.id;
        return (
          <button
            key={env.id}
            type="button"
            onClick={() => onChange(env.id)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border text-left transition-all duration-200",
              compact ? "px-3 py-2.5" : "px-3.5 py-3",
              selected
                ? "border-accent-vivid/50 bg-accent-vivid/10 text-foreground shadow-[0_0_0_1px_oklch(0.66_0.15_58/0.35)]"
                : "border-border bg-card hover:border-foreground/25 hover:-translate-y-px",
            )}
            aria-pressed={selected}
          >
            <EnvironmentThumb env={env} className="size-10 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{env.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {env.description}
              </span>
            </span>
            {selected && <CheckIcon className="size-4 shrink-0 text-accent-vivid" />}
          </button>
        );
      })}
    </div>
  );
}
